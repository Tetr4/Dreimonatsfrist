import 'datejs';

module.exports = {
    loadEntries: function(callback) {
        $.getJSON("./termine/", function(json) {
            var entries = asCalendarDataSource(json);
            callback(entries);
        });
    },
    loadLocations: function(callback) {
        $.getJSON("../reiseziele/", function(json) {
            callback(json);
        });
    },
    loadUsers: function(callback) {
        $.getJSON("./benutzer/", function(json) {
            callback(json);
        });
    },
    loadUser: function(callback) {
        var pathSegments = window.location.pathname.split('/');
        var userId = pathSegments.pop() || pathSegments.pop(); // trailing slash
        $.getJSON("../benutzer/"+userId, function(json) {
            callback(json);
        });
    },
    addEntry: function({ entry, success, error }) {
        entry.date = entry.startDate.toString("yyyy-MM-dd");
        $.ajax({
            url: "./termine/" + entry.date + "/",
            type: 'POST',
            data: entry,
            dataType: "text",
            success: success,
            error: error
        });
    },
    updateEntry: function({ entry, oldDate, success, error }) {
        entry.date = entry.startDate.toString("yyyy-MM-dd");
        $.ajax({
            url: "./termine/" + oldDate.toString("yyyy-MM-dd") + "/",
            type: 'PUT',
            data: entry,
            success: success,
            error: error
        });
    },
    deleteEntry: function({ entry, success, error }) {
        entry.date = entry.startDate.toString("yyyy-MM-dd");
        $.ajax({
            url: "./termine/" + entry.date + "/",
            type: 'DELETE',
            success: success,
            error: error
        });
    }
}

function asCalendarDataSource(entries) {
    for (let i in entries) {
        var entry = entries[i];
        entry.id = parseInt(entry.id);
        entry.startDate = Date.parse(entry.date);
        entry.supplement = entry.supplement == null ? '' : entry.supplement;
        entry.comment = entry.comment == null ? '' : entry.comment;
        entry.endDate = entry.startDate;
    }
    return entries;
}
