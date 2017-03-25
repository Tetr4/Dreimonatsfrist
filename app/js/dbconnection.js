import $ from 'jquery';
import 'datejs';

module.exports = {
    loadLocations: function(callback) {
        $.getJSON('/kalender/api/reiseziele/', function(json) {
            callback(json);
        });
    },
    loadUsers: function(callback) {
        $.getJSON('/kalender/api/benutzer/', function(json) {
            callback(json);
        });
    },
    loadUser: function(userId, callback) {
        $.getJSON('/kalender/api/benutzer/' + userId, function(json) {
            callback(json);
        });
    },
    loadEntries: function(userId, callback) {
        $.getJSON('/kalender/api/benutzer/' + userId + '/termine/', function(json) {
            callback(asCalendarDataSource(json));
        });
    },
    addEntry: function({
        userId,
        entry,
        success,
        error
    }) {
        entry.date = entry.startDate.toString('yyyy-MM-dd');
        $.ajax({
            url: '/kalender/api/benutzer/' + userId + '/termine/' + entry.date + '/',
            type: 'POST',
            data: entry,
            dataType: 'text',
            success: success,
            error: error
        });
    },
    updateEntry: function({
        userId,
        entry,
        oldDate,
        success,
        error
    }) {
        entry.date = entry.startDate.toString('yyyy-MM-dd');
        oldDate = oldDate.toString('yyyy-MM-dd');
        $.ajax({
            url: '/kalender/api/benutzer/' + userId + '/termine/' + oldDate + '/',
            type: 'PUT',
            data: entry,
            success: success,
            error: error
        });
    },
    deleteEntry: function({
        userId,
        entry,
        success,
        error
    }) {
        entry.date = entry.startDate.toString('yyyy-MM-dd');
        $.ajax({
            url: '/kalender/api/benutzer/' + userId + '/termine/' + entry.date + '/',
            type: 'DELETE',
            success: success,
            error: error
        });
    }
}

function asCalendarDataSource(entries) {
    for (let i in entries) {
        const entry = entries[i];
        entry.id = parseInt(entry.id);
        entry.startDate = Date.parse(entry.date);
        entry.supplement = entry.supplement == null ? '' : entry.supplement;
        entry.comment = entry.comment == null ? '' : entry.comment;
        entry.endDate = entry.startDate;
    }
    return entries;
}
