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
import marker from './errormarker';
import tooltip from './tooltip';
import colors from './colors';

$(function() {
    initCalendar();
    initModal();
    dbconnection.loadUser(function(user) {
        var title = "Kalender von " + user.vorname + " " + user.name;
        $('#user-name').text(title);
        $(document).attr("title", title);
    });
    dbconnection.loadEntries(function(entries) {
        marker.markErrors(entries);
        $('#calendar').data('calendar').setDataSource(entries);
    });
});

function initCalendar() {
    $('#calendar').calendar({
        enableRangeSelection: false,
        allowOverlap: false,
        language: 'de',
        style: 'custom',
        clickDay: function(e) {
            if (e.events.length > 0) {
                editEvent(e.events[0]);
            } else {
                editEvent({
                    startDate: e.date
                })
            }
        },
        mouseOnDay: function(e) {
            if (e.events.length > 0) {
                var entry = e.events[0];
                var color = colors.fromMark[entry.mark];
                var content = tooltip(color, entry).html();

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
        customDataSourceRenderer: function(element, date, events) {
            if (events.length > 0) {
                var shadowColor = colors.fromMark[events[0].mark];
                var boxShadow = 'inset 0 -' + 4 + 'px 0 0 ' + shadowColor;
                element.parent().css('box-shadow', boxShadow);
            }
        }
    });
}

function initModal() {
    $('#save-event').click(function() {
        saveEvent();
    });
    $('#delete-event').click(function() {
        deleteEvent();
    });
    var letters = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
    for (let i in letters) {
        var option = $('<option>').val(letters[i]).text(letters[i]);
        $('#event-location-supplement').append(option);
    };
    $("#event-location-supplement").selectpicker("refresh");
    dbconnection.loadLocations(function(locations) {
        for (let i in locations) {
            var location = locations[i].name;
            var option = $('<option>').val(location).text(location);
            $('#event-location').append(option);
        }
        $("#event-location").selectpicker("refresh");
    });
}

function editEvent(event) {
    $('#event-modal input[name="event-index"]').val(event ? event.id : '');
    $('#event-modal input[name="event-mark"]').val(event ? event.mark : errormarker.NONE);
    $('#event-modal select[id="event-location"]').selectpicker('val', event ? event.location : '');
    $('#event-modal select[id="event-location-supplement"]').selectpicker('val', event ? event.supplement : '');
    $('#event-modal input[name="event-comment"]').val(event ? event.comment : '');
    $('#event-modal input[name="event-start-date"]').datepicker('update', event ? event.startDate : '');
    event.id ? $('#delete-event').show() : $('#delete-event').hide();
    $('#event-modal').modal();
}

function deleteEvent() {
    var id = $('#event-modal input[name="event-index"]').val();
    var entries = $('#calendar').data('calendar').getDataSource();
    for (let i in entries) {
        if (entries[i].id == id) {
            dbconnection.deleteEntry({
                entry: entries[i],
                success: function() {
                    entries.splice(i, 1);
                    marker.markErrors(entries);
                    $('#calendar').data('calendar').setDataSource(entries);
                    $('#event-modal').modal('hide');
                },
                error: function(jqXHR, textStatus, error) {
                    alert(textStatus + ': ' + error);
                }
            });
            break;
        }
    }
}

function saveEvent() {
    var event = {
        id: $('#event-modal input[name="event-index"]').val(),
        mark: $('#event-modal input[name="event-mark"]').val(),
        location: $('#event-modal select[id="event-location"]').val(),
        supplement: $('#event-modal select[id="event-location-supplement"]').val(),
        comment: $('#event-modal input[name="event-comment"]').val().trim(),
        startDate: $('#event-modal input[name="event-start-date"]').datepicker('getDate'),
        endDate: $('#event-modal input[name="event-start-date"]').datepicker('getDate')
    }
    var entries = $('#calendar').data('calendar').getDataSource();
    if (event.id) {
        for (var i in entries) {
            if (entries[i].id == event.id) {
                dbconnection.updateEntry({
                    entry: event,
                    oldDate: entries[i].startDate,
                    success: function() {
                        entries[i].mark = event.mark;
                        entries[i].location = event.location;
                        entries[i].supplement = event.supplement;
                        entries[i].comment = event.comment;
                        entries[i].startDate = event.startDate;
                        entries[i].endDate = event.startDate;
                        marker.markErrors(entries);
                        $('#calendar').data('calendar').setDataSource(entries);
                        $('#event-modal').modal('hide');
                    },
                    error: function(jqXHR, textStatus, error) {
                        alert(textStatus + ': ' + error);
                    }
                });
                break;
            }
        }
    } else {
        dbconnection.addEntry({
            entry: event,
            success: function(newId) {
                event.id = newId;
                entries.push(event);
                marker.markErrors(entries);
                $('#calendar').data('calendar').setDataSource(entries);
                $('#event-modal').modal('hide');
            },
            error: function(jqXHR, textStatus, error) {
                alert(textStatus + ': ' + error);
            }
        });
    }
}
