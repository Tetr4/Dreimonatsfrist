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
        entry.date = Date.parse(entry.date);
        entry.startDate = entry.date;
        entry.endDate = entry.date;
    }
    return entries;
}
