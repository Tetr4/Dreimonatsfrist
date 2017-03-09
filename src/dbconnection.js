import 'datejs';

module.exports = {
    loadEntries: function(callback) {
        $.getJSON("./entries/", function(json) {
            var entries = asCalendarDataSource(json);
            callback(entries);
        });
    },
    addEntry: function(entry) {
        console.log("add");
        console.log(entry);
    },
    updateEntry: function(entry) {
        console.log("update");
        console.log(entry);
    },
    deleteEntry: function(entry) {
        console.log("delete");
        console.log(entry);
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
