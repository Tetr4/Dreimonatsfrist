const NONE = "NONE";
const WARN = "WARN";
const ERROR = "ERROR";

module.exports = {
    markErrors: function(entries) {
        markAll(entries, NONE);
        for (let i in entries) {
             // ignore entries that were marked by other calls to markIfRequired()
            if (entries[i].marked == NONE) {
                markIfRequired(entries[i], entries);
            }
        }
    },
    NONE: NONE,
    WARN: WARN,
    ERROR: ERROR
}

function markIfRequired(startentry, entries) {
    var entriesWithSameLocation = getEntriesWithSameLocation(entries, startentry.location);
    var entriesWithSameWeek = getEntriesWithSameWeek(entriesWithSameLocation, startentry.startDate.getWeek());
    var warnings = [];
    var errors = [];

    // mark if there are at least 3 entries for same location in same week
    if (entriesWithSameWeek.length >= 3) {
        markAll(entriesWithSameWeek, WARN);

        sortByDate(entriesWithSameWeek);
        var earliestInWeek = entriesWithSameWeek[0].startDate;
        var latestInWeek = entriesWithSameWeek[entriesWithSameWeek.length-1].startDate;
        var errorAfterDate = earliestInWeek.clone().addDays(91);

        // step through following dates and repeatedly mark if within 28 days after last marked date
        var latestMarkedDate = latestInWeek;
        var followingEntries = getEntriesAfterDate(entriesWithSameLocation, latestMarkedDate);
        sortByDate(followingEntries);
        for (let i in followingEntries) {
            var nextEntry = followingEntries[i];
            var stepEndDate = latestMarkedDate.clone().addDays(28);
            if (! nextEntry.startDate.isBefore(stepEndDate)) {
                // more than 28 days after last marked date
                break;
            }
            nextEntry.marked = nextEntry.startDate.isBefore(errorAfterDate) ? WARN : ERROR;
            latestMarkedDate = nextEntry.startDate;
        }
    }
}

function getEntriesWithSameLocation(entries, location) {
    return entries.filter(function(entry) {
        return entry.location === location;
    });
}

function getEntriesWithSameWeek(entries, week) {
    return entries.filter(function(entry) {
        return entry.startDate.getWeek() === week;
    });
}

function sortByDate(entries) {
    entries.sort(function(entry, otherEntry) {
        return Date.compare(entry.startDate, otherEntry.startDate);
    });
}

function markAll(entries, type) {
    for (let i in entries) {
        entries[i].marked = type;
    }
}

function getEntriesAfterDate(entries, start) {
    return entries.filter(function(entry) {
        return entry.startDate.isAfter(start);
    })
}
