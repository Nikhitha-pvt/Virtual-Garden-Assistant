<?php

require_once __DIR__ . '/../config/Database.php';

class Plant {
    private $conn;
    private $table_name = "plants";

    public $id;
    public $garden_id;
    public $name;
    public $species;
    public $planting_date;
    public $watering_frequency;
    public $sunlight_needs;
    public $notes;
    public $last_watered;
    public $created_at;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                (garden_id, name, species, planting_date, watering_frequency, sunlight_needs, notes) 
                VALUES (:garden_id, :name, :species, :planting_date, :watering_frequency, :sunlight_needs, :notes)";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $this->garden_id = htmlspecialchars(strip_tags($this->garden_id));
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->species = htmlspecialchars(strip_tags($this->species));
        $this->planting_date = htmlspecialchars(strip_tags($this->planting_date));
        $this->watering_frequency = htmlspecialchars(strip_tags($this->watering_frequency));
        $this->sunlight_needs = htmlspecialchars(strip_tags($this->sunlight_needs));
        $this->notes = htmlspecialchars(strip_tags($this->notes));

        $stmt->bindParam(":garden_id", $this->garden_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":species", $this->species);
        $stmt->bindParam(":planting_date", $this->planting_date);
        $stmt->bindParam(":watering_frequency", $this->watering_frequency);
        $stmt->bindParam(":sunlight_needs", $this->sunlight_needs);
        $stmt->bindParam(":notes", $this->notes);

        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function findById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByGardenId($gardenId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE garden_id = :garden_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":garden_id", $gardenId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET name = :name,
                    species = :species,
                    planting_date = :planting_date,
                    watering_frequency = :watering_frequency,
                    sunlight_needs = :sunlight_needs,
                    notes = :notes
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->species = htmlspecialchars(strip_tags($this->species));
        $this->planting_date = htmlspecialchars(strip_tags($this->planting_date));
        $this->watering_frequency = htmlspecialchars(strip_tags($this->watering_frequency));
        $this->sunlight_needs = htmlspecialchars(strip_tags($this->sunlight_needs));
        $this->notes = htmlspecialchars(strip_tags($this->notes));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":species", $this->species);
        $stmt->bindParam(":planting_date", $this->planting_date);
        $stmt->bindParam(":watering_frequency", $this->watering_frequency);
        $stmt->bindParam(":sunlight_needs", $this->sunlight_needs);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return $this->findById($this->id);
        }
        return false;
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function getWateringSchedule($gardenId) {
        $query = "SELECT p.*, 
                    DATE_ADD(p.last_watered, INTERVAL p.watering_frequency DAY) as next_watering_date
                FROM " . $this->table_name . " p
                WHERE p.garden_id = :garden_id
                ORDER BY next_watering_date ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":garden_id", $gardenId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateLastWatered($id) {
        $query = "UPDATE " . $this->table_name . "
                SET last_watered = CURRENT_DATE
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        if($stmt->execute()) {
            return $this->findById($id);
        }
        return false;
    }
} 