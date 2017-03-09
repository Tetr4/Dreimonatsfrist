import 'datejs';

module.exports = {
    loadEntries: function(callback) {
        $.getJSON("./entries/", function(json) {
            var entries = asCalendarDataSource(json);
            callback(entries);
        });
    },
    addEntry: function({ entry, success, error }) {
        entry.date = entry.startDate.toString("yyyy-MM-dd");
        $.ajax({
            url: "./entries/" + entry.date + "/",
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
            url: "./entries/" + oldDate.toString("yyyy-MM-dd") + "/",
            type: 'PUT',
            data: entry,
            success: success,
            error: error
        });
    },
    deleteEntry: function({ entry, success, error }) {
        entry.date = entry.startDate.toString("yyyy-MM-dd");
        $.ajax({
            url: "./entries/" + entry.date + "/",
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
