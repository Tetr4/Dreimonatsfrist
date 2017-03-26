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
        $embed_entries = isset($_GET['embed_entries']) && $_GET['embed_entries'] === '1';
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                if (isset($_GET['user_id'])) {
                    $users->get($_GET['user_id'], $embed_entries);
                } else {
                    $users->get_all($embed_entries);
                }
                break;
            default:
                // 405 - Method Not Allowed
                respond(405, "Method Not Allowed");
            }
    }
}

class Users extends DatabaseConnection {
	public function get_all($embed_entries) {
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
		if ($result->num_rows === 0) {
			// 404 - Not Found
			respond(404, "No users found");
		}
        $users = $this->sql_result_to_array($result);
        if ($embed_entries) {
            foreach ($users as &$user) {
                $this->embed_entries($user);
            }
        }
        // 200 - OK
		respond(200, "Users found", $users);
	}

    public function get($user_id, $embed_entries) {
		$user_id = $this->mysqli->real_escape_string($user_id);
        $result = $this->mysqli->query("
                SELECT ID AS id,
                       Name AS name,
                       Vorname AS vorname,
                       Firma AS firma,
                       Kostenstelle AS kostenstelle
               FROM `User` WHERE ID = $user_id
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        if($result->num_rows === 0) {
            // 404 - Not Found
            respond(404, "User not found");
        }
        $user = $result->fetch_assoc();
        if ($embed_entries) {
            $this->embed_entries($user);
        }
        // 200 - OK
        respond(200, "User found", $user);
    }

    private function embed_entries(&$user) {
		$user_id = $this->mysqli->real_escape_string($user['id']);
        $result = $this->mysqli->query("
                SELECT e.ID AS id,
                       e.User AS userId,
                       e.Date AS date,
                       l.Name AS location,
                       e.LocationSupplement AS supplement,
                       e.Comment AS comment
                FROM `Entry` AS e
                    JOIN Location AS l
                      ON e.Location = l.ID
                WHERE e.User = $user_id
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        if($result->num_rows === 0) {
            // user doesn't have entries
            $user['entries'] = array();
        } else {
            $user['entries'] = $this->sql_result_to_array($result);
        }
    }
}

$service = new UsersService();
$service->set_headers();
$service->disable_caching();
$service->process_request();
