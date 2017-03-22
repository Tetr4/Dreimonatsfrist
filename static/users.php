<?php
ini_set('display_errors', 'On');
require_once "include/DatabaseConnection.php";
require_once "include/Response.php";

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
                $users->get_all();
                break;
            default:
                // 405 - Method Not Allowed
                respond(405, "Method Not Allowed");
            }
    }
}

class Users extends DatabaseConnection {
	public function get_all() {
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
}

$service = new UsersService();
$service->set_headers();
$service->disable_caching();
$service->process_request();
