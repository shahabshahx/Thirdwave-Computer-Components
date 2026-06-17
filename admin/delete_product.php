<?php
/**
 * Thirdwave Purge PC Component Listing
 */
require_once '../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// Admin Protection check
if (!isset($_SESSION['admin'])) {
    header("Location: ../login.php");
    exit;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id > 0) {
    // Check if product exists first and read image filename to unlink it
    $stmt = $conn->prepare("SELECT image FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if ($product) {
        // Disconnect visual image attachment from desk storage
        if (!empty($product['image'])) {
            $file_path = '../uploads/' . $product['image'];
            if (file_exists($file_path)) {
                @unlink($file_path);
            }
        }
        
        // Let SQL delete cascades handle removing referential entries if needed
        $del_stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $del_stmt->bind_param("i", $id);
        if ($del_stmt->execute()) {
            $del_stmt->close();
            header("Location: manage_products.php?msg=deleted");
            exit;
        } else {
            $err_msg = urlencode("Execution Failure deleting product: " . $del_stmt->error);
            $del_stmt->close();
            header("Location: manage_products.php?err=" . $err_msg);
            exit;
        }
    } else {
        header("Location: manage_products.php?err=" . urlencode("Component record target not found inside catalog slots."));
        exit;
    }
} else {
    header("Location: manage_products.php?err=" . urlencode("Invalid product delete parameter sequence request."));
    exit;
}
?>
