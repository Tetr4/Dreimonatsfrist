import 'babel-polyfill';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-toggle'
import 'bootstrap-toggle/css/bootstrap-toggle.css'
import $ from 'jquery';
import "../css/userlist.css";
import dbconnection from './dbconnection';
import filter from './userfilter';

var users;
var errorUsers;
$(function() {
    dbconnection.loadUsers({
        withEntries: true,
        success: onUsersAvailable
    });
});

function onUsersAvailable(availableUsers) {
    users = availableUsers;
    onSearch($('#mitarbeiter_suche').val());
    $('#mitarbeiter_suche').on('input', function() {
        onSearch($(this).val());
    });
    $('#error-toggle').change(function() {
        onSearch($('#mitarbeiter_suche').val());
    });
}

function onSearch(query) {
    clearList();
    var result;
    if (shouldShowErrors()) {
        errorUsers = errorUsers ? errorUsers : filter.getErrorUsers(users);
        result = filter.getMatchingUsers(errorUsers, query);
    } else {
        result = filter.getMatchingUsers(users, query);
    }
    showUsers(result);
}

function shouldShowErrors() {
    return $('#error-toggle').prop('checked');
}

function clearList() {
    $('#mitarbeiterausgabe tr:not(:first)').remove();
}

function showUsers(users) {
    for (let i in users) {
        const row = $('<tr>');
        row.append($('<td>').text(users[i].name));
        row.append($('<td>').text(users[i].vorname));
        row.append($('<td>').text(users[i].id));
        row.append($('<td>').text(users[i].firma));
        row.append($('<td>').text(users[i].kostenstelle));
        const button = $('<a class="btn" role="button">Auswählen</a>')
            .attr("href", "./" + users[i].id)
            .addClass(shouldShowErrors() ? 'btn-warning' : 'btn-success');
        row.append($('<td>').append(button));
        $('#mitarbeiterausgabe').append(row);
    }
}
