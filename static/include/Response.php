<?php
function respond($status, $status_message, $data = NULL) {
    header("HTTP/1.1 $status $status_message");

    if(is_null($data)) {
        exit();
    } else {
        // pretty print for browser testing
        //$json_response=json_encode($data, JSON_PRETTY_PRINT);
        //$json_response=str_replace("\n","<br>",$json_response);
        //$json_response=str_replace("\t","<br>",$json_response);

        header("Content-Type:application/json");
        $json_response=json_encode($data);
        exit($json_response);
    }
}
