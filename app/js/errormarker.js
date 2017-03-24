const NONE = "NONE";
const WARN = "WARN";
const ERROR = "ERROR";

module.exports = {
    markErrors: function(entries) {
        markAll(entries, NONE);
        for (let i in entries) {
            // ignore entries that were marked by other calls to markIfRequired()
            if (entries[i].mark == NONE) {
                markIfRequired(entries[i], entries);
            }
        }
    },
    NONE: NONE,
    WARN: WARN,
    ERROR: ERROR
}

function markIfRequired(startentry, entries) {
    const entriesWithSameLocation = getEntriesWithSameLocation(entries, startentry.location, startentry.supplement);
    const entriesWithSameWeek = getEntriesWithSameWeek(entriesWithSameLocation, startentry.startDate.getWeek());
    const warnings = [];
    const errors = [];

    // mark if there are at least 3 entries for same location in same week
    if (entriesWithSameWeek.length >= 3) {
        markAll(entriesWithSameWeek, WARN);

        sortByDate(entriesWithSameWeek);
        const earliestInWeek = entriesWithSameWeek[0].startDate;
        const latestInWeek = entriesWithSameWeek[entriesWithSameWeek.length - 1].startDate;
        const errorAfterDate = earliestInWeek.clone().addMonths(3);
        if (errorAfterDate.getDate() < earliestInWeek.getDate()) {
            // if following month doesn't have enough dates, the required date is the first of the next month.
            // e.g. 3 months after 30-11-2016 is 28-02-2017, as 30-02-2017 doesn't exist, so the required date is 01-03-2017
            errorAfterDate.addDays(1);
        }

        // step through following dates and repeatedly mark if within 28 days after last marked date
        var latestMarkedDate = latestInWeek;
        const followingEntries = getEntriesAfterDate(entriesWithSameLocation, latestMarkedDate);
        sortByDate(followingEntries);
        for (let i in followingEntries) {
            const nextEntry = followingEntries[i];
            const stepEndDate = latestMarkedDate.clone().addDays(29);
            if (!nextEntry.startDate.isBefore(stepEndDate)) {
                // more than 29 days after last marked date
                break;
            }
            nextEntry.mark = nextEntry.startDate.isBefore(errorAfterDate) ? WARN : ERROR;
            latestMarkedDate = nextEntry.startDate;
        }
    }
}

function getEntriesWithSameLocation(entries, location, supplement) {
    return entries.filter(function(entry) {
        return entry.location === location && entry.supplement === supplement;
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
        entries[i].mark = type;
    }
}

function getEntriesAfterDate(entries, start) {
    return entries.filter(function(entry) {
        return entry.startDate.isAfter(start);
    });
}
