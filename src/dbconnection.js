module.exports = {
    loadEntries: function(callback) {
        $.getJSON("./entries.json", function(json) {
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
        entry.id = i;
        entry.startDate = new Date(entry.date.date)
        entry.endDate = new Date(entry.startDate);
    }
    return entries;
}
