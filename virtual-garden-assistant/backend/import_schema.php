<?php
// Database connection parameters
$host = 'localhost';
$username = 'root'; // Change this to your MySQL username
$password = ''; // Change this to your MySQL password

// Create connection without database
$conn = new mysqli($host, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Read the SQL file
$sql = file_get_contents(__DIR__ . '/src/config/schema.sql');

// Execute multi query
if ($conn->multi_query($sql)) {
    echo "Database and tables created successfully!<br>";
    
    // Process all result sets
    do {
        // Store first result set
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());
    
    echo "All queries executed successfully!";
} else {
    echo "Error creating database: " . $conn->error;
}

// Close connection
$conn->close();
?> 