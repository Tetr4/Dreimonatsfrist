<?php
ini_set('display_errors', 'On');
require_once "include/DatabaseConnection.php";
require_once "include/Response.php";

class LocationsService {
    public function set_headers() {
        header("Allow: GET");
    }

    public function disable_caching() {
        header("Cache-Control: public, max-age=0");
    }

    public function process_request() {
        $locations = new Locations();
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                $locations->get_all();
                break;
            default:
                // 405 - Method Not Allowed
                respond(405, "Method Not Allowed");
            }
    }
}

class Locations extends DatabaseConnection {
	public function get_all() {
		$result = $this->mysqli->query("SELECT ID AS id, Name AS name From `Location`");
		if ($this->mysqli->error) {
			// 500 - Internal Server Error
			respond(500, "Error: " . $this->mysqli->error);
		}
		if($result->num_rows === 0) {
			// 404 - Not Found
			respond(404, "No locations found");
		}
        // 200 - OK
		respond(200, "Locations found", $this->sql_result_to_array($result));
	}
}

$service = new LocationsService();
$service->set_headers();
$service->disable_caching();
$service->process_request();
