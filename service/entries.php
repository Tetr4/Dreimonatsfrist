<?php
ini_set('display_errors', 'On');
require_once "include/DatabaseConnection.php";
require_once "include/Response.php";

class CalendarService {
    public function set_headers() {
        header("Allow: HEAD, GET, PUT, POST, DELETE");
    }

    public function disable_caching() {
        header("Cache-Control: public, max-age=0");
    }

    public function process_request() {
        $user_id = $this->get_user_id();
        $calendar = new Calendar($user_id);
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                $this->get($calendar);
                break;
            case 'POST':
                $this->post($calendar);
                break;
            case 'PUT':
                $this->put($calendar);
                break;
            case 'DELETE':
                $this->delete($calendar);
                break;
            case 'HEAD':
                $this->head($calendar);
                break;
            default:
                // 405 - Method Not Allowed
                respond(405, "Method Not Allowed");
            }
    }

    private function get_user_id() {
        if (!isset($_GET['user_id'])) {
            // 400 - Bad Request
            respond(400, "User ID required");
        }
        return $_GET['user_id'];
    }

    private function get($calendar) {
        if (isset($_GET['date'])) {
            $calendar->get_entry($_GET['date']);
        } else {
            $calendar->get_entries();
        }
    }

    private function post($calendar) {
        if(!isset($_GET['date'])) {
            // 400 - Bad Request
            respond(400, "Date required");
        }
        $data = $this->get_input_data();
        if(!isset($data['location']) || !isset($data['supplement']) || !isset($data['comment'])) {
            // 400 - Bad Request
            respond(400, "Location, supplement (may be null) and comment (may be null) required");
        }
        $calendar->add_entry($_GET['date'], $data);
    }

    private function put($calendar) {
        if(!isset($_GET['date'])) {
            // 400 - Bad Request
            respond(400, "Date required");
        }
        $data = $this->get_input_data();
        if(!isset($data['location']) || !isset($data['date']) || !isset($data['supplement']) || !isset($data['comment'])) {
            // 400 - Bad Request
            respond(400, "New location, date, supplement (may be null) and comment (may be null) required");
        }
        $calendar->update_entry($_GET['date'], $data);
    }

    private function delete($calendar) {
        if(!isset($_GET['date'])) {
            // 400 - Bad Request
            respond(400, "Entry required");
        }
        $calendar->delete_entry($_GET['date']);
    }

    private function head($calendar) {
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
}

class Calendar extends DatabaseConnection {
    private $user_id;

	function __construct($user_id) {
        parent::__construct();
        $this->user_id = $this->mysqli->real_escape_string($user_id);
	}

	public function get_entries() {
		$result = $this->mysqli->query("
				SELECT e.ID AS id,
                       e.Date AS date,
                       l.Name AS location,
                       e.LocationSupplement AS supplement,
                       e.Comment AS comment
				FROM `Entry` AS e
       				JOIN Location AS l
         			  ON e.Location = l.ID
				WHERE  e.User = $this->user_id
		");
		if ($this->mysqli->error) {
			// 500 - Internal Server Error
			respond(500, "Error: " . $this->mysqli->error);
		}
		if($result->num_rows === 0) {
			// 404 - Not Found
			respond(404, "Entries for user $this->user_id not found");
		}
        // 200 - OK
		respond(200, "Entries found", $this->sql_result_to_array($result));
	}

    public function get_entry($date) {
        $date = $this->mysqli->real_escape_string($date);
        $result = $this->mysqli->query("
				SELECT e.ID AS id,
                       e.Date AS date,
                       l.Name AS location,
                       e.LocationSupplement AS supplement,
                       e.Comment AS comment
				FROM `Entry` AS e
       				JOIN Location AS l
         			  ON e.Location = l.ID
				WHERE e.User = $this->user_id AND e.Date = '$date'
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

    public function add_entry($date, $data) {
        $date = $this->mysqli->real_escape_string($date);
        $location_id = $this->get_location_id($data['location']);
        $supplement = $this->as_sql_null_or_nonempty_sql_string($data['supplement']);
        $comment = $this->as_sql_null_or_nonempty_sql_string($data['comment']);
        $this->mysqli->query("
                INSERT INTO `Entry` (`ID`, `User`, `Date`, `Location`, `LocationSupplement`, `Comment`)
                    SELECT NULL, $this->user_id, '$date', $location_id, $supplement, $comment
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        // 201 - Created
        respond(201, "Entry created", $this->mysqli->insert_id);
    }

    public function update_entry($date, $data){
        if(!$this->entry_exists($date)) {
            // 404 - Not Found
            respond(404, "Entry not found");
        }
        $date = $this->mysqli->real_escape_string($date);
        $new_date = $this->mysqli->real_escape_string($data['date']);
        $new_location_id = $this->get_location_id($data['location']);
        $supplement = $this->as_sql_null_or_nonempty_sql_string($data['supplement']);
        $comment = $this->as_sql_null_or_nonempty_sql_string($data['comment']);
        $result = $this->mysqli->query("
                UPDATE `Entry`
                SET
                    Date = '$new_date',
                    Location = $new_location_id,
                    LocationSupplement = $supplement,
                    Comment = $comment
                WHERE User = $this->user_id AND Date = '$date'
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

    private function entry_exists($date) {
        $date = $this->mysqli->real_escape_string($date);
        $result = $this->mysqli->query("
                SELECT * FROM `Entry`
                WHERE User = $this->user_id AND Date = '$date'
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        return $result->num_rows !== 0;
    }

    public function delete_entry($date) {
        $date = $this->mysqli->real_escape_string($date);
        $result = $this->mysqli->query("
                DELETE FROM `Entry`
                WHERE User = $this->user_id AND Date = '$date'
        ");
        if ($this->mysqli->error) {
            // 500 - Internal Server Error
            respond(500, "Error: " . $this->mysqli->error);
        }
        var_dump($result->affected_rows);
        if($this->mysqli->affected_rows === 0) {
            // 404 - Not Found
            respond(404, "Entry not found");
        }
        // 204 - No Content (OK, but no data in response)
        respond(204, "Entry deleted");
    }
}

$service = new CalendarService();
$service->set_headers();
$service->disable_caching();
$service->process_request();
