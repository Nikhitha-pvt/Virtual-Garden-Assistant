<?php
// Database connection parameters
$host = 'localhost';
$dbname = 'virtual_garden';
$username = 'root'; // Change this to your MySQL username
$password = ''; // Change this to your MySQL password

try {
    // Create connection
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected successfully to database: $dbname<br><br>";
    
    // Get all tables
    $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tables in the database:<br>";
    foreach ($tables as $table) {
        echo "- $table<br>";
        
        // Count records in each table
        $count = $conn->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        echo "  Records: $count<br><br>";
    }
    
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

// Close connection
$conn = null;
?> 