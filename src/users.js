import 'babel-polyfill';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import "./user.css";
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
    var result = users.filter(function(user) {
        return user.name.startsWith(query) || user.id.startsWith(query);
    });
    showUsers(result);
}

function showUsers(users) {
    //$('#mitarbeiterausgabe').empty();
    $('#mitarbeiterausgabe tr:not(:first)').remove();
    for (let i in users) {
        var row = $('<tr>');
        row.append($('<td>').text(users[i].name));
        row.append($('<td>').text(users[i].vorname));
        row.append($('<td>').text(users[i].id));
        row.append($('<td>').text(users[i].firma));
        row.append($('<td>').text(users[i].kostenstelle));
        var button = $('<a class="btn btn-primary" role="button">Auswählen</a>')
                .attr("href","./" + users[i].id);
        row.append($('<td>').append(button));
        $('#mitarbeiterausgabe').append(row);
    }
}
