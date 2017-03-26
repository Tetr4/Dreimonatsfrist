import marker from './entrymarker';

module.exports = {
    getMatchingUsers: function(users, query) {
        return users.filter(function(user) {
            return user.name.startsWith(query) || user.id.startsWith(query);
        });
    },
    getErrorUsers: function(users) {
        return users.map(markEntries).reduce(collectErrorUsers, []);
    }
}

function markEntries(user) {
    marker.markErrors(user.entries);
    return user;
}

function collectErrorUsers(collector, user) {
    if (containsErrorEntry(user.entries)) {
        collector.push(user)
    }
    return collector;
}

function containsErrorEntry(entries) {
    for (let i in entries) {
        const hasError = entries[i].mark === marker.ERROR;
        const isProccessed = entries[i].comment.trim().length > 0;
        if (hasError && !isProccessed) {
            return true;
        }
    }
    return false;
}
