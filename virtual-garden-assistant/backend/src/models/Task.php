<?php

require_once __DIR__ . '/../config/Database.php';

class Task {
    private $conn;
    private $table_name = "tasks";

    public $id;
    public $garden_id;
    public $title;
    public $description;
    public $due_date;
    public $status;
    public $created_at;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                (garden_id, title, description, due_date, status) 
                VALUES (:garden_id, :title, :description, :due_date, :status)";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $this->garden_id = htmlspecialchars(strip_tags($this->garden_id));
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->due_date = htmlspecialchars(strip_tags($this->due_date));
        $this->status = htmlspecialchars(strip_tags($this->status));

        $stmt->bindParam(":garden_id", $this->garden_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":due_date", $this->due_date);
        $stmt->bindParam(":status", $this->status);

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
                SET title = :title,
                    description = :description,
                    due_date = :due_date,
                    status = :status
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->due_date = htmlspecialchars(strip_tags($this->due_date));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":due_date", $this->due_date);
        $stmt->bindParam(":status", $this->status);
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

    public function getUpcomingTasks($gardenId) {
        $query = "SELECT * FROM " . $this->table_name . "
                WHERE garden_id = :garden_id
                AND due_date >= CURRENT_DATE
                AND status = 'pending'
                ORDER BY due_date ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":garden_id", $gardenId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOverdueTasks($gardenId) {
        $query = "SELECT * FROM " . $this->table_name . "
                WHERE garden_id = :garden_id
                AND due_date < CURRENT_DATE
                AND status = 'pending'
                ORDER BY due_date ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":garden_id", $gardenId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
} 