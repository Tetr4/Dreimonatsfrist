import 'babel-polyfill';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import dbconnection from './dbconnection';

$(function() {
    dbconnection.loadUsers(function(users) {
        for(let i in users) {
            $('#user-list').append('<li><a href="./' + users[i].id + '">'+ users[i].name +'</a></li>');
        }
    });
});
