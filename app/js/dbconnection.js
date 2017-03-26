import $ from 'jquery';
import 'datejs';

module.exports = {
    loadLocations: function({
        success,
        error
    }) {
        $.ajax({
            url: '/kalender/api/locations',
            dataType: 'json',
            success: success,
            error: error
        });
    },

    loadUsers: function({
        withEntries,
        success,
        error
    }) {
        const query = withEntries ? '?embed_entries=1' : '';
        $.ajax({
            url: '/kalender/api/users' + query,
            dataType: 'json',
            success: function(users) {
                for (let i in users) {
                    if (users[i].entries) {
                        users[i].entries = asCalendarDataSource(users[i].entries);
                    }
                }
                success(users);
            },
            error: error
        });
    },

    loadUser: function({
        userId,
        withEntries,
        success,
        error
    }) {
        const query = withEntries ? '?embed_entries=1' : '';
        $.ajax({
            url: '/kalender/api/users/' + userId + query,
            dataType: 'json',
            success: function(user) {
                if (user.entries) {
                    user.entries = asCalendarDataSource(user.entries);
                }
                success(user);
            },
            error: error
        });
    },

    addEntry: function({
        entry,
        success,
        error
    }) {
        entry.date = entry.startDate.toString('yyyy-MM-dd');
        $.ajax({
            url: '/kalender/api/entries',
            type: 'POST',
            data: entry,
            dataType: 'text',
            success: success,
            error: error
        });
    },

    updateEntry: function({
        entry,
        success,
        error
    }) {
        entry.date = entry.startDate.toString('yyyy-MM-dd');
        $.ajax({
            url: '/kalender/api/entries/' + entry.id,
            type: 'PUT',
            data: entry,
            success: success,
            error: error
        });
    },

    deleteEntry: function({
        entry,
        success,
        error
    }) {
        entry.date = entry.startDate.toString('yyyy-MM-dd');
        $.ajax({
            url: '/kalender/api/entries/' + entry.id,
            type: 'DELETE',
            success: success,
            error: error
        });
    }
}

function asCalendarDataSource(entries) {
    for (let i in entries) {
        const entry = entries[i];
        entry.id = parseInt(entry.id);
        entry.startDate = Date.parse(entry.date);
        entry.supplement = entry.supplement == null ? '' : entry.supplement;
        entry.comment = entry.comment == null ? '' : entry.comment;
        entry.endDate = entry.startDate;
    }
    return entries;
}
