import 'babel-polyfill';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import $ from 'jquery';
import "../css/userlist.css";
import dbconnection from './dbconnection';

var users;
$(function() {
    dbconnection.loadUsers(function(result) {
        users = result;
        onSearch($('#mitarbeiter_suche').val());
        $('#mitarbeiter_suche').on('input', function() {
            onSearch($(this).val());
        });
    });
});

function onSearch(query) {
    const result = users.filter(function(user) {
        return user.name.startsWith(query) || user.id.startsWith(query);
    });
    clearList();
    showUsers(result);
}

function showUsers(users) {
    for (let i in users) {
        const row = $('<tr>');
        row.append($('<td>').text(users[i].name));
        row.append($('<td>').text(users[i].vorname));
        row.append($('<td>').text(users[i].id));
        row.append($('<td>').text(users[i].firma));
        row.append($('<td>').text(users[i].kostenstelle));
        const button = $('<a class="btn btn-primary" role="button">Auswählen</a>')
            .attr("href", "./" + users[i].id);
        row.append($('<td>').append(button));
        $('#mitarbeiterausgabe').append(row);
    }
}

function clearList() {
    $('#mitarbeiterausgabe tr:not(:first)').remove();
}
