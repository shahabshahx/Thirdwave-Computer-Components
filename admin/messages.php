<?php
/**
 * Thirdwave Help Desk Contact messages
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

// Delete message log
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_message') {
    $message_id = intval($_POST['message_id']);
    if ($message_id > 0) {
        $del_stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
        $del_stmt->bind_param("i", $message_id);
        if ($del_stmt->execute()) {
            $msg = "Ticket record deleted from support logs.";
        } else {
            $err = "Could not delete ticket entry: " . $del_stmt->error;
        }
        $del_stmt->close();
    }
}

// Fetch all support messages
$sql = "SELECT * FROM contact_messages ORDER BY id DESC";
$result = $conn->query($sql);
?>

<div style="margin-bottom:30px;">
  <span class="admin-badge">Support Desk</span>
  <h1 class="page-title" style="margin-top:5px; margin-bottom:5px;">Inbox <span>Messages</span></h1>
  <p class="page-subtitle" style="margin-bottom:0;">Read custom suggestions, configuration help tickets, hardware listings, & support desk logs.</p>
</div>

<?php if (!empty($msg)): ?>
  <div class="alert alert-success"><?php echo $msg; ?></div>
<?php endif; ?>

<?php if (!empty($err)): ?>
  <div class="alert alert-danger"><?php echo $err; ?></div>
<?php endif; ?>

<div class="table-responsive">
  <table class="table" id="messages_table">
    <thead>
      <tr>
        <th style="width:70px;">Ticket ID</th>
        <th style="width:200px;">Contact Information</th>
        <th>Inquiry Details</th>
        <th style="width:150px;">Received Date</th>
        <th style="width:80px; text-align:center;">Action</th>
      </tr>
    </thead>
    <tbody>
      <?php if ($result && $result->num_rows > 0): ?>
        <?php while($row = $result->fetch_assoc()): ?>
          <tr id="row_msg_<?php echo $row['id']; ?>">
            <td style="font-family: var(--font-mono); font-size:12px;">#TW-MSG<?php echo $row['id']; ?></td>
            <td>
              <strong style="color:#f8fafc; font-size:14px;"><?php echo htmlspecialchars($row['name']); ?></strong><br>
              <a href="mailto:<?php echo htmlspecialchars($row['email']); ?>" style="font-size:11px; color:var(--accent-color); display:block; margin-top:3px; word-break:break-all;"><?php echo htmlspecialchars($row['email']); ?></a>
            </td>
            <td>
              <span style="font-size:13px; font-weight:600; color:#f8fafc; display:block; margin-bottom:5px;">Subject: <?php echo htmlspecialchars($row['subject']); ?></span>
              <div style="background-color:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); padding:10px; border-radius:4px; font-size:12px; color:var(--text-muted); line-height:1.5; white-space:pre-wrap;">
                <?php echo htmlspecialchars($row['message']); ?>
              </div>
            </td>
            <td style="font-size:12px; color:var(--text-muted);">
              <?php echo date('M d, Y - h:i A', strtotime($row['created_at'])); ?>
            </td>
            <td style="text-align: center;">
              <form action="messages.php" method="POST" onsubmit="return confirm('Do you wish to completely archive and delete support bulletin TW-MSG<?php echo $row['id']; ?>?')">
                <input type="hidden" name="action" value="delete_message">
                <input type="hidden" name="message_id" value="<?php echo $row['id']; ?>">
                <button type="submit" class="btn btn-danger btn-sm" style="padding:4px 8px;" title="Archive & Delete ticket"><i data-lucide="archive" style="width:13px; height:13px;"></i></button>
              </form>
            </td>
          </tr>
        <?php endwhile; ?>
      <?php else: ?>
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
            <i data-lucide="mail-open" style="width:36px; height:36px; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto;"></i>
            No active support desk help bulletins found. System is fully caught up!
          </td>
        </tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php require_once '../includes/footer.php'; ?>
