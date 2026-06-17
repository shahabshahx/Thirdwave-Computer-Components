<?php
/**
 * Thirdwave Used Hardware Trading & Liquidation Board
 */
require_once '../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// Protection check
if (!isset($_SESSION['admin'])) {
    header("Location: ../login.php");
    exit;
}

require_once '../includes/header.php';

$msg = '';
$err = '';

// Update Offer Status Action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_status') {
    $request_id = intval($_POST['request_id']);
    $new_status = trim($_POST['status']);
    
    $allowed_statuses = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];
    
    if ($request_id > 0 && in_array($new_status, $allowed_statuses)) {
        $update_stmt = $conn->prepare("UPDATE sell_requests SET status = ? WHERE id = ?");
        $update_stmt->bind_param("si", $new_status, $request_id);
        if ($update_stmt->execute()) {
            $msg = "Trade offer state altered and saved to <strong>$new_status</strong> successfully.";
        } else {
            $err = "Could not update trade entry state: " . $update_stmt->error;
        }
        $update_stmt->close();
    }
}

// Delete Offer Entry Action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_request') {
    $request_id = intval($_POST['request_id']);
    if ($request_id > 0) {
        $del_stmt = $conn->prepare("DELETE FROM sell_requests WHERE id = ?");
        $del_stmt->bind_param("i", $request_id);
        if ($del_stmt->execute()) {
            $msg = "Trade request registration deleted successfully.";
        } else {
            $err = "Execution Failure: " . $del_stmt->error;
        }
        $del_stmt->close();
    }
}

// Fetch all liquidation trade components
$sql = "SELECT * FROM sell_requests ORDER BY id DESC";
$result = $conn->query($sql);
?>

<div style="margin-bottom:30px;">
  <span class="admin-badge">Appraisals Center</span>
  <h1 class="page-title" style="margin-top:5px; margin-bottom:5px;">Sell <span>Requests Board</span></h1>
  <p class="page-subtitle" style="margin-bottom:0;">Appraise and review used computer components listed for trade, contact sellers with offers, & manage status tracking.</p>
</div>

<?php if (!empty($msg)): ?>
  <div class="alert alert-success"><?php echo $msg; ?></div>
<?php endif; ?>

<?php if (!empty($err)): ?>
  <div class="alert alert-danger"><?php echo $err; ?></div>
<?php endif; ?>

<div class="table-responsive">
  <table class="table" id="trading_table">
    <thead>
      <tr>
        <th style="width:70px;">Offer ID</th>
        <th>Submitter Information</th>
        <th>Component Hardware Specs</th>
        <th>Pricing & Condition</th>
        <th>Trade Status</th>
        <th style="width:160px;">Progress Action</th>
        <th style="width:80px; text-align:center;">Action</th>
      </tr>
    </thead>
    <tbody>
      <?php if ($result && $result->num_rows > 0): ?>
        <?php while($row = $result->fetch_assoc()): ?>
          <tr id="row_request_<?php echo $row['id']; ?>">
            <td style="font-family: var(--font-mono); font-size:12px;">#TW-TR<?php echo $row['id']; ?></td>
            <td>
              <strong style="color:#f8fafc; font-size:14px;"><?php echo htmlspecialchars($row['seller_name']); ?></strong><br>
              <span style="font-size:11px; color:var(--text-muted); display:block; margin-top:2px;">Email: <?php echo htmlspecialchars($row['email']); ?></span>
              <span style="font-size:11px; color:var(--text-muted); display:block;">Callback: <?php echo htmlspecialchars($row['phone']); ?></span>
            </td>
            <td>
              <span style="font-size:13px; font-weight:600; color:#f8fafc;"><?php echo htmlspecialchars($row['component_name']); ?></span><br>
              <span class="category-tag" style="position:static; margin-top:4px; display:inline-block; font-size:10px;"><?php echo htmlspecialchars($row['category']); ?></span>
              <div style="font-size:11px; color:var(--text-muted); margin-top:5px; font-style:italic; line-height:1.4;">
                <strong>Seller Notes:</strong> <?php echo htmlspecialchars($row['description']); ?>
              </div>
            </td>
            <td>
              <span style="font-family:var(--font-mono); font-weight:700; color:var(--accent-color); font-size:15px;">$<?php echo number_format($row['expected_price'], 2); ?></span><br>
              <span style="font-size:11px; display:block; margin-top:4px; color:var(--text-muted);">Declared Condition:<br><strong style="color:white;"><?php echo htmlspecialchars($row['component_condition']); ?></strong></span>
            </td>
            <td>
              <?php 
                $status_clean = strtolower($row['status']);
                $badge_class = 'badge-pending';
                if ($status_clean === 'reviewed') $badge_class = 'badge-reviewed';
                elseif ($status_clean === 'accepted') $badge_class = 'badge-accepted';
                elseif ($status_clean === 'rejected') $badge_class = 'badge-rejected';
              ?>
              <span class="badge <?php echo $badge_class; ?>"><?php echo htmlspecialchars($row['status']); ?></span>
            </td>
            <td>
              <form action="sell_requests.php" method="POST" class="status-form">
                <input type="hidden" name="action" value="update_status">
                <input type="hidden" name="request_id" value="<?php echo $row['id']; ?>">
                <select name="status" class="form-control" style="padding-top:4px; padding-bottom:4px;" onchange="this.form.submit()">
                  <option value="Pending" <?php echo ($row['status'] === 'Pending') ? 'selected' : ''; ?>>Pending</option>
                  <option value="Reviewed" <?php echo ($row['status'] === 'Reviewed') ? 'selected' : ''; ?>>Reviewed</option>
                  <option value="Accepted" <?php echo ($row['status'] === 'Accepted') ? 'selected' : ''; ?>>Accepted</option>
                  <option value="Rejected" <?php echo ($row['status'] === 'Rejected') ? 'selected' : ''; ?>>Rejected</option>
                </select>
              </form>
            </td>
            <td style="text-align: center;">
              <form action="sell_requests.php" method="POST" onsubmit="return confirm('Do you wish to completely remove trade registration offer TW-TR<?php echo $row['id']; ?> from the logs database?')">
                <input type="hidden" name="action" value="delete_request">
                <input type="hidden" name="request_id" value="<?php echo $row['id']; ?>">
                <button type="submit" class="btn btn-danger btn-sm" style="padding:4px 8px;" title="Delete trade request info"><i data-lucide="trash-2" style="width:13px; height:13px;"></i></button>
              </form>
            </td>
          </tr>
        <?php endwhile; ?>
      <?php else: ?>
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
            <i data-lucide="award" style="width:36px; height:36px; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto;"></i>
            No used component trade offers have been submitted yet. Reach out to local PC builders!
          </td>
        </tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php require_once '../includes/footer.php'; ?>
