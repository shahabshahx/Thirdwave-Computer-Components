<?php
/**
 * Thirdwave Customer Purchase Billings Desk
 */
require_once '../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// Protection block
if (!isset($_SESSION['admin'])) {
    header("Location: ../login.php");
    exit;
}

require_once '../includes/header.php';

$msg = '';
$err = '';

// Handle Order Status Update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_status') {
    $order_id = intval($_POST['order_id']);
    $new_status = trim($_POST['status']);
    
    $allowed_statuses = ['Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'];
    
    if ($order_id > 0 && in_array($new_status, $allowed_statuses)) {
        // If status changes to Cancelled, we can optionally restore stock. Let's do it for extra high-fidelity logic!
        if ($new_status === 'Cancelled') {
            // Read target order quantity and product
            $stmt = $conn->prepare("SELECT product_id, quantity, status FROM orders WHERE id = ?");
            $stmt->bind_param("i", $order_id);
            $stmt->execute();
            $order = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            
            // Refund stock if order wasn't already cancelled
            if ($order && $order['status'] !== 'Cancelled') {
                $pid = $order['product_id'];
                $qty = $order['quantity'];
                
                $conn->query("UPDATE products SET stock_quantity = stock_quantity + $qty WHERE id = $pid");
            }
        }
        
        $update_stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $update_stmt->bind_param("si", $new_status, $order_id);
        if ($update_stmt->execute()) {
            $msg = "Order status updated to <strong>$new_status</strong> successfully.";
        } else {
            $err = "Failed to update order status: " . $update_stmt->error;
        }
        $update_stmt->close();
    } else {
        $err = "Invalid parameters parsed to status processor.";
    }
}

// Handle Order Delete Action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_order') {
    $order_id = intval($_POST['order_id']);
    if ($order_id > 0) {
        $del_stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
        $del_stmt->bind_param("i", $order_id);
        if ($del_stmt->execute()) {
            $msg = "Order invoice deleted from system records.";
        } else {
            $err = "Failed to delete order entry: " . $del_stmt->error;
        }
        $del_stmt->close();
    }
}

// Fetch all orders with product names and unit prices
$sql = "SELECT o.*, p.name AS product_name, p.price AS unit_price FROM orders o 
        JOIN products p ON o.product_id = p.id 
        ORDER BY o.id DESC";
$result = $conn->query($sql);
?>

<div style="margin-bottom: 30px;">
  <span class="admin-badge">Logistics Center</span>
  <h1 class="page-title" style="margin-top:5px; margin-bottom:5px;">Customer <span>Orders</span></h1>
  <p class="page-subtitle" style="margin-bottom:0;">Interact with buyer transactions, coordinate packaging levels, dispatch shipments, & track invoice statuses.</p>
</div>

<?php if (!empty($msg)): ?>
  <div class="alert alert-success"><?php echo $msg; ?></div>
<?php endif; ?>

<?php if (!empty($err)): ?>
  <div class="alert alert-danger"><?php echo $err; ?></div>
<?php endif; ?>

<div class="table-responsive">
  <table class="table" id="orders_table">
    <thead>
      <tr>
        <th style="width:70px;">Inv ID</th>
        <th>Buyer Details</th>
        <th>Component Selected</th>
        <th>Qty</th>
        <th>Invoice Total</th>
        <th>Current Status</th>
        <th style="width:160px;">Alter Status</th>
        <th style="width:80px; text-align:center;">Action</th>
      </tr>
    </thead>
    <tbody>
      <?php if ($result && $result->num_rows > 0): ?>
        <?php while($row = $result->fetch_assoc()): ?>
          <tr id="row_order_<?php echo $row['id']; ?>">
            <td style="font-family: var(--font-mono); font-size:12px;">#TW-<?php echo $row['id']; ?></td>
            <td>
              <strong style="color:#f8fafc; font-size:14px;"><?php echo htmlspecialchars($row['customer_name']); ?></strong><br>
              <span style="font-size:11px; color:var(--text-muted); display:block; margin-top:2px;" title="Email info"><?php echo htmlspecialchars($row['email']); ?></span>
              <span style="font-size:11px; color:var(--text-muted); display:block;" title="Call Customer"><?php echo htmlspecialchars($row['phone']); ?></span>
              <span style="font-size:11px; color:var(--text-muted); display:block; font-style:italic;" title="Address text">Location: <?php echo htmlspecialchars($row['address']); ?></span>
            </td>
            <td>
              <span style="font-size:13px; font-weight:600; color:#f8fafc;"><?php echo htmlspecialchars($row['product_name']); ?></span><br>
              <span style="font-family: var(--font-mono); font-size:11px; color:var(--text-muted);">Unit value: $<?php echo number_format($row['unit_price'], 2); ?></span>
            </td>
            <td style="font-family: var(--font-mono); text-align:center; font-weight:bold;"><?php echo $row['quantity']; ?></td>
            <td style="font-family: var(--font-mono); font-weight:700; color:#3b82f6;">$<?php echo number_format($row['total_price'], 2); ?></td>
            <td>
              <?php 
                $status_clean = strtolower($row['status']);
                $badge_class = 'badge-pending';
                if ($status_clean === 'confirmed') $badge_class = 'badge-confirmed';
                elseif ($status_clean === 'processing') $badge_class = 'badge-processing';
                elseif ($status_clean === 'delivered') $badge_class = 'badge-delivered';
                elseif ($status_clean === 'cancelled') $badge_class = 'badge-cancelled';
              ?>
              <span class="badge <?php echo $badge_class; ?>"><?php echo htmlspecialchars($row['status']); ?></span>
            </td>
            <td>
              <form action="manage_orders.php" method="POST" class="status-form">
                <input type="hidden" name="action" value="update_status">
                <input type="hidden" name="order_id" value="<?php echo $row['id']; ?>">
                <select name="status" class="form-control" style="padding-top:4px; padding-bottom:4px;" onchange="this.form.submit()">
                  <option value="Pending" <?php echo ($row['status'] === 'Pending') ? 'selected' : ''; ?>>Pending</option>
                  <option value="Confirmed" <?php echo ($row['status'] === 'Confirmed') ? 'selected' : ''; ?>>Confirmed</option>
                  <option value="Processing" <?php echo ($row['status'] === 'Processing') ? 'selected' : ''; ?>>Processing</option>
                  <option value="Delivered" <?php echo ($row['status'] === 'Delivered') ? 'selected' : ''; ?>>Delivered</option>
                  <option value="Cancelled" <?php echo ($row['status'] === 'Cancelled') ? 'selected' : ''; ?>>Cancelled</option>
                </select>
              </form>
            </td>
            <td style="text-align: center;">
              <form action="manage_orders.php" method="POST" onsubmit="return confirm('Do you absolutely wish to delete product order TW-<?php echo $row['id']; ?> from active registry?')">
                <input type="hidden" name="action" value="delete_order">
                <input type="hidden" name="order_id" value="<?php echo $row['id']; ?>">
                <button type="submit" class="btn btn-danger btn-sm" style="padding:4px 8px;" title="Purge Record"><i data-lucide="trash-2" style="width:13px; height:13px;"></i></button>
              </form>
            </td>
          </tr>
        <?php endwhile; ?>
      <?php else: ?>
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
            <i data-lucide="inbox" style="width:36px; height:36px; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto;"></i>
            No client checkout orders currently indexed. Try placing test transactions on products!
          </td>
        </tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php require_once '../includes/footer.php'; ?>
