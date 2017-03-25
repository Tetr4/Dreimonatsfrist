<?php
ini_set('display_errors', 'On');
require_once "include/DatabaseConnection.php";
require_once "include/Response.php";

class EntriesService {
    public function set_headers() {
        if (isset($_GET['entry_id'])) {
            header("Allow: HEAD, GET, PUT, POST, DELETE");
        } else {
            header("Allow: GET");
        }
    }

    public function disable_caching() {
        header("Cache-Control: public, max-age=0");
    }

    public function process_request() {
        $entries = new Entries();
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                $this->get($entries);
                break;
            case 'POST':
                $this->post($entries);
                break;
            case 'PUT':
                $this->put($entries);
                break;
            case 'DELETE':
                $this->delete($entries);
                break;
            case 'HEAD':
                $this->head($entries);
                break;
            default:
                // 405 - Method Not Allowed
                respond(405, "Method Not Allowed");
            }
    }

    private function get($entries) {
        if (isset($_GET['entry_id'])) {
            $entries->get($_GET['entry_id']);
        } else if (isset($_GET['user_id'])) {
            $entries->get_for_user($_GET['user_id']);
        } else {
            $entries->get_all();
        }
    }

    private function post($entries) {
        if (isset($_GET['entry_id'])) {
            // 400 - Bad Request
            respond(400, "Cannot post on entry");
        }
        $data = $this->get_input_data();
        $this->validate($data);
        $entries->add($data);
    }

    private function put($entries) {
        if(!isset($_GET['entry_id'])) {
            // 400 - Bad Request
            respond(400, "Entry ID required");
        }
        $data = $this->get_input_data();
        $this->validate($data);
        $entries->update($_GET['entry_id'], $data);
    }

    private function delete($entries) {
        if(!isset($_GET['entry_id'])) {
            // 400 - Bad Request
            respond(400, "Entry ID required");
        }
        $entries->delete($_GET['entry_id']);
    }

    private function head($entries) {
        // 200 OK
        respond(200, "Entry list found");
    }

    private function get_input_data() {
        $input_vars = file_get_contents("php://input");
        if(empty($input_vars)) {
            // 400 - Bad Request
            respond(400, "Values required");
        }
        $json = json_decode($input_vars, TRUE);
        if(json_last_error() === JSON_ERROR_NONE) {
            // encoding: application/json
            return $json;
        } else {
            // encoding: application/x-www-form-urlencoded
            parse_str($input_vars, $urlencoded);
            return $urlencoded;
        }
    }

    private function validate($data) {
        $required_fields = array('userId', 'date', 'location', 'supplement', 'comment');
        foreach ($required_fields as $field) {
            if(!isset($data[$field])) {
                // 400 - Bad Request
                respond(400, "userId, date, location, supplement (may be 'null') and comment (may be 'null') are required");
            }
        }
    }
}

class Entries extends DatabaseConnection {
    public function get($entry_id) {
        $entry_id = $this->mysqli->real_escape_string($entry_id);
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
                WHERE e.ID = $entry_id
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        if($result->num_rows === 0) {
            // 404 - Not Found
            respond(404, "Entry not found");
        }
        // 200 - OK
        respond(200, "Entry found", $result->fetch_assoc());
    }

	public function get_for_user($user_id) {
        $user_id = $this->mysqli->real_escape_string($user_id);
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
			// 404 - Not Found
			respond(404, "Entries for user $user_id not found");
		}
        // 200 - OK
		respond(200, "Entries found", $this->sql_result_to_array($result));
	}

    public function get_all() {
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
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        if($result->num_rows === 0) {
            // 404 - Not Found
            respond(404, "Entries not found");
        }
        // 200 - OK
        respond(200, "Entries found", $this->sql_result_to_array($result));
    }

    public function add($data) {
        $user_id = $this->mysqli->real_escape_string($data['userId']);
        $date = $this->mysqli->real_escape_string($data['date']);
        $location_id = $this->get_location_id($data['location']);
        $supplement = $this->as_sql_null_or_nonempty_sql_string($data['supplement']);
        $comment = $this->as_sql_null_or_nonempty_sql_string($data['comment']);
        $this->mysqli->query("
                INSERT INTO `Entry` (`ID`, `User`, `Date`, `Location`, `LocationSupplement`, `Comment`)
                    SELECT NULL, $user_id, '$date', $location_id, $supplement, $comment
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        // 201 - Created
        respond(201, "Entry created", $this->mysqli->insert_id);
    }

    public function update($entry_id, $data){
        if(!$this->entry_exists($entry_id)) {
            // 404 - Not Found
            respond(404, "Entry not found");
        }
        $entry_id = $this->mysqli->real_escape_string($entry_id);
        $user_id = $this->mysqli->real_escape_string($data['userId']);
        $date = $this->mysqli->real_escape_string($data['date']);
        $location_id = $this->get_location_id($data['location']);
        $supplement = $this->as_sql_null_or_nonempty_sql_string($data['supplement']);
        $comment = $this->as_sql_null_or_nonempty_sql_string($data['comment']);
        $result = $this->mysqli->query("
                UPDATE `Entry`
                SET
                    Date = '$date',
                    User = $user_id,
                    Location = $location_id,
                    LocationSupplement = $supplement,
                    Comment = $comment
                WHERE ID = $entry_id
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        // 204 - No Content (OK, but no data in response)
        respond(204, "Entry updated");
    }

    private function get_location_id($location) {
        $location = $this->mysqli->real_escape_string($location);
        $result = $this->mysqli->query("
                SELECT ID FROM `Location`
                WHERE Name = '$location' LIMIT 1"
        );
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        if($result->num_rows === 0) {
            // 404 - Not Found
            respond(404, "Location not found");
        }
        return $result->fetch_assoc()['ID'];
    }

    private function as_sql_null_or_nonempty_sql_string($val) {
        if (is_null($val) || trim($val) === '') {
            return 'NULL';
        }
        return "'".$this->mysqli->real_escape_string($val)."'";
    }

    private function entry_exists($entry_id) {
        $entry_id = $this->mysqli->real_escape_string($entry_id);
        $result = $this->mysqli->query("
                SELECT * FROM `Entry` WHERE ID = $entry_id
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        return $result->num_rows !== 0;
    }

    public function delete($entry_id) {
        $entry_id = $this->mysqli->real_escape_string($entry_id);
        $result = $this->mysqli->query("
                DELETE FROM `Entry` WHERE ID = $entry_id
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        if($this->mysqli->affected_rows === 0) {
            // 404 - Not Found
            respond(404, "Entry not found");
        }
        // 204 - No Content (OK, but no data in response)
        respond(204, "Entry deleted");
    }
}

$service = new EntriesService();
$service->set_headers();
$service->disable_caching();
$service->process_request();
