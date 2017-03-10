<?php
function respond($status, $status_message) {
    header("HTTP/1.1 $status $status_message");
    exit();
}

$mysqli = new mysqli("localhost","root","password","kalender");
if ($mysqli->connect_errno) {
    // 500 - Internal Server Error
    respond(500, "Failed to connect to Database: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
}
$mysqli->set_charset("utf8");
$results = $mysqli->query("SELECT ID, Name FROM `User`");
if ($mysqli->error) {
    // 500 - Internal Server Error
    respond(500, "Error: " . $mysqli->error);
}
?>
<html>
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        <div class="container">
            <h1 class="page-header">Benutzer</h1>
            <ul>
            <?php
            while ($row = $results->fetch_object()){
                echo "<li><a href='./$row->ID/'>$row->Name</a></li>";
            }
            ?>
            </ul>
        </div>
        <script type="text/javascript" src="./users.bundle.js" charset="UTF-8"></script>
    </body>
</html>
<?php $mysqli->close(); ?>
