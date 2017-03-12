import 'babel-polyfill';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-datepicker';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.css';
import 'bootstrap-year-calendar';
import 'bootstrap-year-calendar/js/languages/bootstrap-year-calendar.de.js';
import 'bootstrap-year-calendar/css/bootstrap-year-calendar.css';
import 'bootstrap-year-calendar/css/bootstrap-year-calendar.css';
import 'bootstrap-select';
import 'bootstrap-select/dist/css/bootstrap-select.css';
import $ from 'jquery';
import 'datejs';
import style from "./style.css";
import dbconnection from './dbconnection';
import marker from './errormarker';


const markToColor = [];
markToColor[marker.NONE] = 'rgb(30, 200, 20)';
markToColor[marker.WARN] = 'rgb(255, 150, 0)';
markToColor[marker.ERROR] = 'rgb(255, 50, 50)';

$(function() {
    initCalendar();
    initModal();
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
                var content = '';

                var color = markToColor[e.events[0].marked];
                content += '<div class="event-tooltip-content">' +
                    '<div class="event-name" style="color:' + color + '">' + e.events[0].location + '</div>' +
                    '</div>';

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
            if(events.length > 0) {
                var boxShadow;
                var color = markToColor[events[0].marked];
                var boxShadow = 'inset 0 -' + 4 + 'px 0 0 ' + color;
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
    dbconnection.loadLocations(function(locations) {
        for(let i in locations) {
            var location = locations[i].name;
            $('#event-location').append('<option value="'+location+'">'+location+'</option>');
        }
        $("#event-location").selectpicker("refresh");
    });
}

function editEvent(event) {
    $('#event-modal input[name="event-index"]').val(event ? event.id : '');
    $('#event-modal input[name="event-marked"]').val(event ? event.marked : errormarker.NONE);
    $('#event-modal select[id="event-location"]').selectpicker('val', event ? event.location : '');
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
        marked: $('#event-modal input[name="event-marked"]').val(),
        location: $('#event-modal select[id="event-location"]').val(),
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
                        entries[i].marked = event.marked;
                        entries[i].location = event.location;
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
