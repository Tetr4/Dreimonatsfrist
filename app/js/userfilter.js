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
    if (containsMark(user.entries, marker.ERROR)) {
        collector.push(user)
    }
    return collector;
}

function containsMark(entries, mark) {
    for (let i in entries) {
        if (entries[i].mark === mark) {
            return true;
        }
    }
    return false;
}
