<?php
/**
 * Thirdwave Database Connection
 * Optimized for standard XAMPP localhost and easy AwardSpace deployment.
 */

$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "thirdwave_db";
$db_port = 3306;

// Create connection using PHP extension mysqli
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name, $db_port);

// Check connection
if ($conn->connect_error) {
    die("<div style='background:#fee2e2;color:#ef4444;padding:15px;border-radius:6px;font-family:sans-serif;margin:20px;'>
            <strong>Database Connection Error!</strong> Please make sure you have created the database <code>thirdwave_db</code> and imported <code>database.sql</code>. <br>
            Error details: " . htmlspecialchars($conn->connect_error) . "
         </div>");
}

// Set charset to utf8mb4 for unicode compatibility
$conn->set_charset("utf8mb4");
?>
