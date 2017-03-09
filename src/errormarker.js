module.exports = {
    markErrors: function(entries) {
        unmarkAll(entries);
        for (let i in entries) {
            markIfRequired(entries[i], entries);
        }
    }
}

function unmarkAll(entries) {
    for (let i in entries) {
        entries[i].marked = false;
    }
}

function markIfRequired(entry, entries) {
    var entriesWithSameLocation = getEntriesWithSameLocation(entries, entry.location);
    var entriesWithSameWeek = getEntriesWithSameWeek(entriesWithSameLocation, entry.startDate.getISOWeek());

    // mark if there are at least 3 entries for same location in same week
    if (entriesWithSameWeek.length >= 3) {
        markAll(entriesWithSameWeek);

        // mark dates up to 91 days from the earliest marked date
        sortByDate(entriesWithSameWeek);
        var earliestInWeek = entriesWithSameWeek[0].startDate;
        var latestInWeek = entriesWithSameWeek[entriesWithSameWeek.length-1].startDate;
        var followingEntriesEnd = earliestInWeek.clone().addDays(91);
        markFollowing(entriesWithSameLocation, latestInWeek, followingEntriesEnd);
    }
}

function markFollowing(entries, latestMarkedDate, followingEntriesEnd) {
    var followingEntriesStart = latestMarkedDate.clone().addDays(1);
    var followingEntries = getEntriesBetweenDates(entries, followingEntriesStart, followingEntriesEnd);

    // step through following dates and repeatedly mark if within 28 days after last marked date
    sortByDate(followingEntries);
    for (let i in followingEntries) {
        var nextEntry = followingEntries[i];
        var rangeStart = latestMarkedDate.clone().addDays(1);
        var rangeEnd = latestMarkedDate.clone().addDays(28);
        if (nextEntry.startDate.between(rangeStart, rangeEnd)) {
            nextEntry.marked = true;
            latestMarkedDate = nextEntry.startDate;
        } else {
            break;
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
        return entry.startDate.getISOWeek() === week;
    });
}

function sortByDate(entries) {
    entries.sort(function(entry, otherEntry) {
        return entry.startDate.isAfter(otherEntry.startDate);
    });
}

function markAll(entries) {
    for (let i in entries) {
        entries[i].marked = true;
    }
}

function getEntriesBetweenDates(entries, start, end) {
    return entries.filter(function(entry) {
        return entry.startDate.between(start, end);
    })
}
