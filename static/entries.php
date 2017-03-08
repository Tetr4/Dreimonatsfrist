<?php
ini_set('display_errors', 'On');

// get calendar entries from database and echo as JSON
$page = new CalendarPage();
$page->disable_caching();
$user_id = $page->get_user_id();
$calendar = new Calendar($user_id);
$calendar->mark_errors();
$page->print_as_json($calendar->entries);


class CalendarPage {
    public function disable_caching() {
        header("Cache-Control: public, max-age=0");
    }

    public function get_user_id() {
        if (!isset($_GET['user_id'])) {
            // 400 - Bad Request
            respond(400, "User ID required");
        }
        return $_GET['user_id'];
    }

    public function print_as_json($data) {
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
    }
}


class Calendar {
	private $mysqli;
    public $entries;

	function __construct($user_id) {
        $this->connect_to_database();
        $this->entries = $this->load_entries($user_id);
        $this->entries = $this->sql_result_to_array($this->entries);
        $this->entries = $this->array_entries_to_objects($this->entries);
        $this->entries = $this->sort_by_date($this->entries);
	}

	function __destruct() {
		$this->mysqli->close();
	}

	private function connect_to_database() {
        $this->mysqli = new mysqli("localhost","root","password","kalender");
        if ($this->mysqli->connect_errno) {
            // 500 - Internal Server Error
            respond(500, "Failed to connect to Database: (" . $this->mysqli->connect_errno . ") " . $this->mysqli->connect_error);
        }
        $this->mysqli->set_charset("utf8");
    }

	private function load_entries($user_id) {
		$user_id = $this->mysqli->real_escape_string($user_id);
		$result = $this->mysqli->query("
				SELECT e.Date, l.Name AS Location, FALSE AS Marked
				FROM `Entry` AS e
       				JOIN Location AS l
         			  ON e.Location = l.ID
				WHERE  e.User = $user_id
		");
		if ($this->mysqli->error) {
			// 500 - Internal Server Error
			respond(500, "Error: " . $this->mysqli->error);
		}
		if($result->num_rows === 0) {
			// 404 - Not Found
			respond(404, "Calendar for user $user_id not found");
		}
        return $result;
	}

    private function sql_result_to_array($result) {
		$data = array();
		while ($row = $result->fetch_assoc()) {
			$data[] = $row;
		}
		return $data;
	}

    private function array_entries_to_objects($entries) {
        foreach ($entries as $key => $entry) {
            $entry_object = (object) $entry;
            $entry_object->date = new DateTimeImmutable($entry['Date']);
            $entry_object->week = $entry_object->date->format("W");
            $entry_object->location = $entry['Location'];
            $entry_object->marked = (bool) $entry['Marked'];
            $entries[$key] = $entry_object;
        }
        return $entries;
    }

    private function sort_by_date($entries) {
        usort($entries, function($a, $b) {
            return $a->date > $b->date;
        });
        return $entries;
    }

    public function mark_errors() {
        foreach ($this->entries as $entry) {
            $same_location = $this->filter_location($this->entries, $entry->location);
            $earliest_matching_entry = $entry;
            $latest_matching_entry = $entry;
            $candidates_to_mark = array($entry);

            $same_location_in_same_week = 0;
            foreach ($same_location as $other_entry) {
                if ($entry->week == $other_entry->week) {
                    $same_location_in_same_week += 1;
                    $earliest_matching_date = min($earliest_matching_entry->date, $other_entry->date);
                    $latest_matching_date = max($earliest_matching_entry->date, $other_entry->date);
                    array_push($candidates_to_mark, $other_entry);
                }
            }

            if ($same_location_in_same_week >= 3) {
                $enddate = $earliest_matching_date->modify('+91 days');
                foreach ($same_location as $other_entry) {
                    if ($other_entry->date > $latest_matching_date
                            && $other_entry->date <= $latest_matching_date->modify('+28 days')
                            && $other_entry->date <= $enddate) {
                        array_push($candidates_to_mark, $other_entry);
                        $latest_matching_date = $other_entry->date;
                    }
                }
                $this->mark_all($candidates_to_mark);
            }
        }
    }

    private function filter_location($entries, $location) {
        array_filter($entries, function($entry) use (&$location) {
            return $entry->location == $location;
        });
        return $entries;
    }

    private function mark_all($entries) {
        foreach ($entries as $entry) {
            $entry->marked = True;
        }
    }
}


function respond($status, $status_message) {
    header("HTTP/1.1 $status $status_message");
    exit();
}
?>
