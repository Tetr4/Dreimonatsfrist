import 'babel-polyfill';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-datepicker';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.css';
import 'bootstrap-year-calendar';
import 'bootstrap-year-calendar/js/languages/bootstrap-year-calendar.de.js';
import 'bootstrap-year-calendar/css/bootstrap-year-calendar.css';
import 'bootstrap-select';
import 'bootstrap-select/dist/css/bootstrap-select.css';
import $ from 'jquery';
import 'datejs';
import "../css/calendar.css";
import dbconnection from './dbconnection';
import marker from './entrymarker';
import tooltip from './tooltip';
import colors from './colors';

var userId;
$(function() {
    userId = getUserId();
    initCalendar();
    initModal();

    dbconnection.loadUser({
        userId: userId,
        withEntries: true,
        success: function(user) {
            setTitle(user);
            marker.markErrors(user.entries);
            $('#calendar').data('calendar').setDataSource(user.entries);
        },
        error: showError
    });
});

function getUserId() {
    // userid is last segment of url (e.g. '/kalender/123')
    const pathSegments = window.location.pathname.split('/');
    return pathSegments.pop() || pathSegments.pop(); // trailing slash
}

function initCalendar() {
    $('#calendar').calendar({
        enableRangeSelection: false,
        allowOverlap: false,
        language: 'de',
        style: 'custom',
        clickDay: function(e) {
            if (e.events.length > 0) {
                editEntry(e.events[0]);
            } else {
                // new entry
                editEntry({
                    startDate: e.date
                });
            }
        },
        mouseOnDay: function(e) {
            if (e.events.length > 0) {
                const entry = e.events[0];
                const color = colors.fromMark[entry.mark];
                const content = tooltip(color, entry).html();

                $(e.element).popover({
                    trigger: 'manual',
                    container: 'body',
                    html: true,
                    content: content
                });

                $(e.element).popover('show');
            }
        },
        mouseOutDay: function(e) {
            if (e.events.length > 0) {
                $(e.element).popover('hide');
            }
        },
        dayContextMenu: function(e) {
            $(e.element).popover('hide');
        },
        customDataSourceRenderer: function(element, date, entries) {
            if (entries.length > 0) {
                const shadowColor = colors.fromMark[entries[0].mark];
                const boxShadow = 'inset 0 -' + 4 + 'px 0 0 ' + shadowColor;
                element.parent().css('box-shadow', boxShadow);
            }
        }
    });
}

function initModal() {
    $('#save-entry').click(function() {
        saveEntry();
    });
    $('#delete-entry').click(function() {
        deleteEntry();
    });
    const letters = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
    for (let i in letters) {
        const option = $('<option>').val(letters[i]).text(letters[i]);
        $('#entry-location-supplement').append(option);
    };
    $("#entry-location-supplement").selectpicker("refresh");
    dbconnection.loadLocations({
        success: function(locations) {
            for (let i in locations) {
                const location = locations[i].name;
                const option = $('<option>').val(location).text(location);
                $('#entry-location').append(option);
            }
            $("#entry-location").selectpicker("refresh");
        },
        error: showError
    });
}

function setTitle(user) {
    const title = "Kalender von " + user.vorname + " " + user.name;
    $('#user-name').text(title);
    $(document).attr("title", title);
}

function showError(jqXHR, textStatus, error) {
    alert(textStatus + ': ' + error);
}

function editEntry(entry) {
    $('#entry-modal input[name="entry-index"]').val(entry.id ? entry.id : '');
    $('#entry-modal input[name="entry-user-index"]').val(entry.userId ? entry.userId : userId);
    $('#entry-modal input[name="entry-mark"]').val(entry.mark ? entry.mark : marker.NONE);
    $('#entry-modal select[id="entry-location"]').selectpicker('val', entry.location ? entry.location : '');
    $('#entry-modal select[id="entry-location-supplement"]').selectpicker('val', entry.supplement ? entry.supplement : '');
    $('#entry-modal input[name="entry-comment"]').val(entry.comment ? entry.comment : '');
    $('#entry-modal input[name="entry-start-date"]').datepicker('update', entry.startDate ? entry.startDate : '');
    entry.id ? $('#delete-entry').show() : $('#delete-entry').hide();
    $('#entry-modal').modal();
}

function deleteEntry() {
    const id = $('#entry-modal input[name="entry-index"]').val();
    const entries = $('#calendar').data('calendar').getDataSource();
    for (let i in entries) {
        if (entries[i].id == id) {
            dbconnection.deleteEntry({
                entry: entries[i],
                success: function() {
                    entries.splice(i, 1);
                    marker.markErrors(entries);
                    $('#calendar').data('calendar').setDataSource(entries);
                    $('#entry-modal').modal('hide');
                },
                error: function(jqXHR, textStatus, error) {
                    alert(textStatus + ': ' + error);
                }
            });
            break;
        }
    }
}

function saveEntry() {
    const entry = {
        id: $('#entry-modal input[name="entry-index"]').val(),
        userId: $('#entry-modal input[name="entry-user-index"]').val(),
        mark: $('#entry-modal input[name="entry-mark"]').val(),
        location: $('#entry-modal select[id="entry-location"]').val(),
        supplement: $('#entry-modal select[id="entry-location-supplement"]').val(),
        comment: $('#entry-modal input[name="entry-comment"]').val().trim(),
        startDate: $('#entry-modal input[name="entry-start-date"]').datepicker('getDate'),
        endDate: $('#entry-modal input[name="entry-start-date"]').datepicker('getDate')
    }
    const entries = $('#calendar').data('calendar').getDataSource();
    if (entry.id) {
        // update existing entry
        for (let i in entries) {
            if (entries[i].id == entry.id) {
                dbconnection.updateEntry({
                    entry: entry,
                    success: function() {
                        entries[i].mark = entry.mark;
                        entries[i].location = entry.location;
                        entries[i].supplement = entry.supplement;
                        entries[i].comment = entry.comment;
                        entries[i].startDate = entry.startDate;
                        entries[i].endDate = entry.startDate;
                        marker.markErrors(entries);
                        $('#calendar').data('calendar').setDataSource(entries);
                        $('#entry-modal').modal('hide');
                    },
                    error: showError
                });
                break;
            }
        }
    } else {
        // add new entry
        dbconnection.addEntry({
            entry: entry,
            success: function(newId) {
                entry.id = newId;
                entries.push(entry);
                marker.markErrors(entries);
                $('#calendar').data('calendar').setDataSource(entries);
                $('#entry-modal').modal('hide');
            },
            error: showError
        });
    }
}
