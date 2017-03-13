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
        row.append('<td>' + users[i].name + '</td>');
        row.append('<td>' + users[i].vorname + '</td>');
        row.append('<td>' + users[i].id + '</td>');
        row.append('<td>' + users[i].firma + '</td>');
        row.append('<td>' + users[i].kostenstelle + '</td>');
        row.append("<td><button type='button' onclick=\"location.href='./" + users[i].id + "/';\">ausw&auml;hlen</button></td>");
        $('#mitarbeiterausgabe').append(row);
    }
}
