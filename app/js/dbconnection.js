import $ from 'jquery';
import 'datejs';

module.exports = {
    loadLocations: function(callback) {
        $.getJSON('/kalender/api/locations', function(json) {
            callback(json);
        });
    },
    loadUsers: function(callback) {
        $.getJSON('/kalender/api/users', function(json) {
            callback(json);
        });
    },
    loadUser: function(userId, callback) {
        $.getJSON('/kalender/api/users/' + userId, function(json) {
            callback(json);
        });
    },
    loadEntries: function(userId, callback) {
        $.getJSON('/kalender/api/entries?user_id=' + userId, function(json) {
            callback(asCalendarDataSource(json));
        });
    },
    addEntry: function({
        entry,
        success,
        error
    }) {
        entry.date = entry.startDate.toString('yyyy-MM-dd');
        $.ajax({
            url: '/kalender/api/entries',
            type: 'POST',
            data: entry,
            dataType: 'text',
            success: success,
            error: error
        });
    },
    updateEntry: function({
        entry,
        success,
        error
    }) {
        entry.date = entry.startDate.toString('yyyy-MM-dd');
        $.ajax({
            url: '/kalender/api/entries/' + entry.id,
            type: 'PUT',
            data: entry,
            success: success,
            error: error
        });
    },
    deleteEntry: function({
        entry,
        success,
        error
    }) {
        entry.date = entry.startDate.toString('yyyy-MM-dd');
        $.ajax({
            url: '/kalender/api/entries/' + entry.id,
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
