import 'babel-polyfill';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-datepicker';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.css';
import 'bootstrap-year-calendar';
import 'bootstrap-year-calendar/js/languages/bootstrap-year-calendar.de.js';
import 'bootstrap-year-calendar/css/bootstrap-year-calendar.css';
import $ from 'jquery';
import 'datejs';
import style from "./style.css";
import dbconnection from './dbconnection';
import marker from './errormarker';

var markedColor = 'rgb(255, 50, 50)';
var defaultColor = 'rgb(30, 200, 20)';

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
        enableRangeSelection: true,
        allowOverlap: false,
        language: 'de',
        style: 'custom',
        selectRange: function(e) {
            editEvent({
                startDate: e.startDate,
                endDate: e.endDate
            });
        },
        clickDay: function(e) {
            if (e.events.length > 0) {
                editEvent(e.events[0]);
            } else {
                editEvent({
                    startDate: e.date,
                    endDate: e.date
                })
            }
        },
        mouseOnDay: function(e) {
            if (e.events.length > 0) {
                var content = '';

                var color = e.events[0].marked ? markedColor : defaultColor;
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
                if (events[0].marked) {
                    boxShadow = 'inset 0 -' + 4 + 'px 0 0 ' + markedColor;
                } else {
                    var boxShadow = 'inset 0 -' + 4 + 'px 0 0 ' + defaultColor;
                }
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
}

function editEvent(event) {
    $('#event-modal input[name="event-index"]').val(event ? event.id : '');
    $('#event-modal input[name="event-marked"]').val(event ? event.marked : '');
    $('#event-modal input[name="event-location"]').val(event ? event.location : '');
    $('#event-modal input[name="event-start-date"]').datepicker('update', event ? event.startDate : '');
    $('#event-modal input[name="event-end-date"]').datepicker('update', event ? event.endDate : '');
    event.id ? $('#delete-event').show() : $('#delete-event').hide();
    $('#event-modal').modal();
}

function deleteEvent() {
    var id = $('#event-modal input[name="event-index"]').val();
    var entries = $('#calendar').data('calendar').getDataSource();
    for (var i in entries) {
        if (entries[i].id == id) {
            dbconnection.deleteEntry(entries[i]);
            entries.splice(i, 1);
            break;
        }
    }
    marker.markErrors(entries);
    $('#calendar').data('calendar').setDataSource(entries);
    $('#event-modal').modal('hide');
}

function saveEvent() {
    var event = {
        id: $('#event-modal input[name="event-index"]').val(),
        marked: $('#event-modal input[name="event-marked"]').val(),
        location: $('#event-modal input[name="event-location"]').val(),
        startDate: $('#event-modal input[name="event-start-date"]').datepicker('getDate'),
        endDate: $('#event-modal input[name="event-end-date"]').datepicker('getDate')
    }
    var entries = $('#calendar').data('calendar').getDataSource();
    if (event.id) {
        for (var i in entries) {
            if (entries[i].id == event.id) {
                entries[i].marked = event.marked;
                entries[i].location = event.location;
                entries[i].startDate = event.startDate;
                entries[i].endDate = event.endDate;
                dbconnection.updateEntry(entries[i]);
            }
        }
    } else {
        var newId = 0;
        for (var i in entries) {
            if (entries[i].id > newId) {
                newId = entries[i].id;
            }
        }
        newId++;
        event.id = newId;
        entries.push(event);
        dbconnection.addEntry(event);
    }
    marker.markErrors(entries);
    $('#calendar').data('calendar').setDataSource(entries);
    $('#event-modal').modal('hide');
}
