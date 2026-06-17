<?php
/**
 * Thirdwave Contact Support Desk
 */
require_once 'includes/db.php';
require_once 'includes/header.php';

$errors = [];
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $subject = trim($_POST['subject']);
    $message = trim($_POST['message']);
    
    // Validation
    if (empty($name)) {
        $errors[] = "Name is required.";
    }
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Please provide a valid response Email.";
    }
    if (empty($subject)) {
        $errors[] = "Subject line is required.";
    }
    if (empty($message)) {
        $errors[] = "Help ticket message details are required.";
    }
    
    if (empty($errors)) {
        $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("ssss", $name, $email, $subject, $message);
            if ($stmt->execute()) {
                $success = true;
            } else {
                $errors[] = "Execution error saving message: " . $stmt->error;
            }
            $stmt->close();
        } else {
            $errors[] = "Database statement compile error: " . $conn->error;
        }
    }
}
?>

<div style="margin-bottom: 30px;">
  <h1 class="page-title">Contact <span>Support Desk</span></h1>
  <p class="page-subtitle">Got build compatibility questions? Looking for a specific graphics card? Send us a ticket.</p>
</div>

<?php if ($success): ?>
  <div class="alert alert-success" style="padding:40px; text-align:center;" id="contact_success">
    <i data-lucide="check-circle" style="width: 56px; height: 56px; color:#10b981; margin: 0 auto 15px; display:block;"></i>
    <h2 style="margin-bottom: 10px;">Message Sent Successfully!</h2>
    <p style="margin-bottom: 20px; max-width:550px; margin-left:auto; margin-right:auto;">Thank you for writing to us. Your ticket has been logged and forwarded directly to our support desk. One of our PC build specialists will reach out to you within 12 working hours.</p>
    <div style="display:flex; justify-content:center; gap: 10px;">
      <a href="products.php" class="btn btn-primary btn-sm">Return to Catalog</a>
      <a href="index.php" class="btn btn-secondary btn-sm">Go to Home</a>
    </div>
  </div>
<?php else: ?>

  <?php if (!empty($errors)): ?>
    <div class="alert alert-danger" id="contact_errors">
      <strong>Please rectify errors:</strong>
      <ul style="margin-top: 5px; margin-left: 20px;">
        <?php foreach($errors as $error): ?>
          <li><?php echo htmlspecialchars($error); ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
  <?php endif; ?>

  <div class="grid-2col" style="grid-template-columns: 1.2fr 0.8fr;">
    <!-- Contact Ticket Form -->
    <div class="form-container" style="max-width:100%; margin:0;">
      <h2 style="font-size:20px; border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:20px;"><i data-lucide="messages-square" style="display:inline-block; vertical-align:middle; width:18px; margin-right:5px;"></i> Send support Bulletin</h2>
      
      <form action="contact.php" method="POST" id="contact_form">
        <div class="grid-2col" style="grid-template-columns:1fr 1fr; gap:15px; margin-bottom:0;">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" name="name" class="form-control form-control-block" placeholder="John Doe" value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" name="email" class="form-control form-control-block" placeholder="john@example.com" value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Subject</label>
          <input type="text" name="subject" class="form-control form-control-block" placeholder="e.g. GPU compatibility check or Trade pricing" value="<?php echo isset($_POST['subject']) ? htmlspecialchars($_POST['subject']) : ''; ?>" required>
        </div>

        <div class="form-group">
          <label class="form-label">Detailed Ticket Message</label>
          <textarea name="message" class="form-control form-control-block" placeholder="Provide complete specs, details, component models, and your questions so we can assist efficiently..." required><?php echo isset($_POST['message']) ? htmlspecialchars($_POST['message']) : ''; ?></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-block" style="margin-top:20px;"><i data-lucide="send"></i> Dispatch Message</button>
      </form>
    </div>

    <!-- Right Side Contact Information Cards -->
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 25px;">
        <h3 style="font-size:18px; margin-bottom:10px;"><i data-lucide="map-pin" style="display:inline-block; vertical-align:middle; width:18px; margin-right:5px; color:#3b82f6;"></i> Office Coordinates</h3>
        <p style="font-size:13px; color:var(--text-muted); line-height:1.6;">
          <strong>Thirdwave Tech Center</strong><br>
          882 Silicon Strip, Suite 400<br>
          New York, NY 10001<br>
          United States
        </p>
      </div>

      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 25px;">
        <h3 style="font-size:18px; margin-bottom:10px;"><i data-lucide="clock" style="display:inline-block; vertical-align:middle; width:18px; margin-right:5px; color:#3b82f6;"></i> Working Hours</h3>
        <p style="font-size:13px; color:var(--text-muted); line-height:1.6;">
          Monday – Friday: 9:00 AM – 6:00 PM EST<br>
          Saturday: 10:00 AM – 4:00 PM EST<br>
          Sunday: Closed (Logistics Dispatch only)
        </p>
      </div>

      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 25px;">
        <h3 style="font-size:18px; margin-bottom:10px;"><i data-lucide="phone" style="display:inline-block; vertical-align:middle; width:18px; margin-right:5px; color:#3b82f6;"></i> Phone / Email</h3>
        <p style="font-size:13px; color:var(--text-muted); line-height:1.6;">
          Phone: +1 (212) 555-SPEC<br>
          Email: support@thirdwavecomponents.com<br>
          Trade: appraisals@thirdwavecomponents.com
        </p>
      </div>
    </div>
  </div>

<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
