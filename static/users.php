<?php
ini_set('display_errors', 'On');

$service = new UsersService();
$service->set_headers();
$service->disable_caching();
$service->process_request();

class UsersService {
    public function set_headers() {
        header("Allow: GET");
    }

    public function disable_caching() {
        header("Cache-Control: public, max-age=0");
    }

    public function process_request() {
        $users = new Users();
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                $users->get();
                break;
            default:
                // 405 - Method Not Allowed
                respond(405, "Method Not Allowed");
            }
    }
}


class Users {
	private $mysqli;

	function __construct() {
        $this->mysqli = new mysqli("localhost","root","password","kalender");
        if ($this->mysqli->connect_errno) {
            // 500 - Internal Server Error
            respond(500, "Failed to connect to Database: (" . $this->mysqli->connect_errno . ") " . $this->mysqli->connect_error);
        }
        $this->mysqli->set_charset("utf8");
	}

	function __destruct() {
		$this->mysqli->close();
	}

	public function get() {
		$result = $this->mysqli->query("
                SELECT ID AS id,
                       Name AS name,
                       Vorname AS vorname,
                       Firma AS firma,
                       Kostenstelle AS kostenstelle
               FROM `User`
        ");
		if ($this->mysqli->error) {
			// 500 - Internal Server Error
			respond(500, "Error: " . $this->mysqli->error);
		}
		if($result->num_rows === 0) {
			// 404 - Not Found
			respond(404, "No users found");
		}
        // 200 - OK
		respond(200, "Users found", $this->sql_result_to_array($result));
	}

    private function sql_result_to_array($result) {
        $data = array();
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        return $data;
    }
}


function respond($status, $status_message, $data = NULL) {
    header("HTTP/1.1 $status $status_message");
    if(is_null($data)) {
        exit();
    } else {
        header("Content-Type:application/json");
        $json_response=json_encode($data);
        exit($json_response);
    }
}
