<?php
/**
 * Thirdwave Component Sell Request
 */
require_once 'includes/db.php';
require_once 'includes/header.php';

$errors = [];
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $seller_name = trim($_POST['seller_name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone']);
    $component_name = trim($_POST['component_name']);
    $category = trim($_POST['category']);
    $expected_price = floatval($_POST['expected_price']);
    $component_condition = trim($_POST['component_condition']);
    $description = trim($_POST['description']);
    
    // Validation Checks
    if (empty($seller_name)) {
        $errors[] = "Seller Name is required.";
    }
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Please provide a valid contact Email address.";
    }
    if (empty($phone)) {
        $errors[] = "Phone number is required so our appraisers can reach you.";
    }
    if (empty($component_name)) {
        $errors[] = "Component Name / Model label is required.";
    }
    if (empty($category) || $category === "0") {
        $errors[] = "Please select a logical Category.";
    }
    if ($expected_price <= 0) {
        $errors[] = "Expected Price must be a positive decimal valuation.";
    }
    if (empty($component_condition)) {
        $errors[] = "Component Condition is required.";
    }
    
    if (empty($errors)) {
        $stmt = $conn->prepare("INSERT INTO sell_requests (seller_name, email, phone, component_name, category, expected_price, component_condition, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");
        if ($stmt) {
            $stmt->bind_param("sssssdss", $seller_name, $email, $phone, $component_name, $category, $expected_price, $component_condition, $description);
            if ($stmt->execute()) {
                $success = true;
            } else {
                $errors[] = "Execution error saving details: " . $stmt->error;
            }
            $stmt->close();
        } else {
            $errors[] = "Statement compilation error: " . $conn->error;
        }
    }
}
?>

<div style="margin-bottom: 30px;">
  <h1 class="page-title">Sell <span>Your Used Components</span></h1>
  <p class="page-subtitle">Submit details of computer parts you wish to sell or liquidate. Our appraisal desk reviews all submissions daily.</p>
</div>

<?php if ($success): ?>
  <div class="alert alert-success" style="padding: 40px; text-align: center;" id="sell_success">
    <i data-lucide="check-circle-2" style="width: 56px; height: 56px; color:#10b981; margin: 0 auto 15px; display:block;"></i>
    <h2 style="margin-bottom: 10px;">Sell Request Submitted!</h2>
    <p style="margin-bottom: 20px; max-width:600px; margin-left:auto; margin-right:auto;">Thank you for submitting your hardware specs. Our verification specialists will analyze your component specifics and contact you with a direct payout quote within 24 working hours.</p>
    <div style="display:flex; justify-content:center; gap:10px;">
      <a href="index.php" class="btn btn-primary btn-sm">Return to Home</a>
      <a href="sell.php" class="btn btn-secondary btn-sm">Submit Another Component</a>
    </div>
  </div>
<?php else: ?>

  <?php if (!empty($errors)): ?>
    <div class="alert alert-danger" id="sell_errors">
      <strong>Please correct the following:</strong>
      <ul style="margin-top: 5px; margin-left: 20px;">
        <?php foreach($errors as $error): ?>
          <li><?php echo htmlspecialchars($error); ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
  <?php endif; ?>

  <div class="grid-2col" style="grid-template-columns: 1.2fr 0.8fr;">
    <!-- Component Details Form -->
    <div class="form-container" style="max-width:100%; margin:0;">
      <h2 style="font-size: 20px; border-bottom: 1px solid var(--border-color); padding-bottom:10px; margin-bottom: 20px;"><i data-lucide="cpu" style="display:inline-block; vertical-align:middle; width:18px; margin-right:5px;"></i> Hardware Specifics Form</h2>
      
      <form action="sell.php" method="POST" id="sell_form">
        
        <div class="grid-2col" style="grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom:0;">
          <div class="form-group">
            <label class="form-label">Seller Name</label>
            <input type="text" name="seller_name" class="form-control form-control-block" placeholder="Your Name" value="<?php echo isset($_POST['seller_name']) ? htmlspecialchars($_POST['seller_name']) : ''; ?>" required>
          </div>
          <div class="form-group">
            <label class="form-label">Contact Email</label>
            <input type="email" name="email" class="form-control form-control-block" placeholder="name@example.com" value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Callback Phone Number</label>
          <input type="text" name="phone" class="form-control form-control-block" placeholder="+1 (555) 7890" value="<?php echo isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : ''; ?>" required>
        </div>

        <div class="form-group">
          <label class="form-label">Component Label & Model Name</label>
          <input type="text" name="component_name" class="form-control form-control-block" placeholder="e.g. Gigabyte NVIDIA RTX 3070 Gaming OC 8GB" value="<?php echo isset($_POST['component_name']) ? htmlspecialchars($_POST['component_name']) : ''; ?>" required>
        </div>

        <div class="grid-3col" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:0;">
          <div class="form-group">
            <label class="form-label">Core Category</label>
            <select name="category" class="form-control form-control-block" required>
              <option value="0">Select Category</option>
              <option value="Processors" <?php echo (isset($_POST['category']) && $_POST['category'] === "Processors") ? 'selected' : ''; ?>>Processors (CPUs)</option>
              <option value="Graphics Cards" <?php echo (isset($_POST['category']) && $_POST['category'] === "Graphics Cards") ? 'selected' : ''; ?>>Graphics Cards (GPUs)</option>
              <option value="RAM" <?php echo (isset($_POST['category']) && $_POST['category'] === "RAM") ? 'selected' : ''; ?>>RAM Modules</option>
              <option value="Storage" <?php echo (isset($_POST['category']) && $_POST['category'] === "Storage") ? 'selected' : ''; ?>>Hard Drives/SSDs</option>
              <option value="Motherboards" <?php echo (isset($_POST['category']) && $_POST['category'] === "Motherboards") ? 'selected' : ''; ?>>Motherboards</option>
              <option value="Power Supplies" <?php echo (isset($_POST['category']) && $_POST['category'] === "Power Supplies") ? 'selected' : ''; ?>>Power Supplies</option>
              <option value="Accessories" <?php echo (isset($_POST['category']) && $_POST['category'] === "Accessories") ? 'selected' : ''; ?>>Other / Accessories</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Condition Level</label>
            <select name="component_condition" class="form-control form-control-block" required>
              <option value="">Select Condition</option>
              <option value="New" <?php echo (isset($_POST['component_condition']) && $_POST['component_condition'] === "New") ? 'selected' : ''; ?>>New (Unopened)</option>
              <option value="Like New" <?php echo (isset($_POST['component_condition']) && $_POST['component_condition'] === "Like New") ? 'selected' : ''; ?>>Like New (Opened, Barely Used)</option>
              <option value="Excellent" <?php echo (isset($_POST['component_condition']) && $_POST['component_condition'] === "Excellent") ? 'selected' : ''; ?>>Excellent (Fully Functional, Clean)</option>
              <option value="Good" <?php echo (isset($_POST['component_condition']) && $_POST['component_condition'] === "Good") ? 'selected' : ''; ?>>Good (Minor Wear / No Box)</option>
              <option value="Fair" <?php echo (isset($_POST['component_condition']) && $_POST['component_condition'] === "Fair") ? 'selected' : ''; ?>>Fair (Scratches / Heavy Use)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Expected Price ($)</label>
            <input type="number" name="expected_price" step="0.01" min="0" class="form-control form-control-block" placeholder="250.00" value="<?php echo isset($_POST['expected_price']) ? htmlspecialchars($_POST['expected_price']) : ''; ?>" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Component History / Benchmarks / Notes</label>
          <textarea name="description" class="form-control form-control-block" placeholder="Include thermal benchmark scores, how long it was used, presence of box, warranty status, etc." required><?php echo isset($_POST['description']) ? htmlspecialchars($_POST['description']) : ''; ?></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-block" style="margin-top:20px;"><i data-lucide="send"></i> Submit Hardware Trade Request</button>
      </form>
    </div>

    <!-- Right Side Information Card -->
    <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 25px; height:max-content;">
      <h2 style="font-size:18px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px;"><i data-lucide="shield-alert" style="display:inline-block; vertical-align:middle; width:18px; margin-right:5px; color:#f59e0b;"></i> Appraisal Criteria</h2>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom:15px; line-height:1.5;">To ensure a streamlined valuation and instant payouts, please align with our criteria specs:</p>
      
      <div style="display:flex; flex-direction:column; gap:15px; font-size:13px;">
        <div style="display:flex; gap:10px;">
          <div style="color:var(--accent-color); font-weight:bold; font-family:var(--font-mono);">01.</div>
          <div><strong>Accurate Descriptions:</strong> Be honest about thermal performance, dusty environments, or minor visual blemishes. Truthful applications process 5x quicker.</div>
        </div>
        <div style="display:flex; gap:10px;">
          <div style="color:var(--accent-color); font-weight:bold; font-family:var(--font-mono);">02.</div>
          <div><strong>Anti-Mining Disclosure:</strong> GPUs used extensively for high-voltage crypto mining should be explicitly disclosed.</div>
        </div>
        <div style="display:flex; gap:10px;">
          <div style="color:var(--accent-color); font-weight:bold; font-family:var(--font-mono);">03.</div>
          <div><strong>Protective Packaging:</strong> When accepted, ship components wrapped heavily in electrostatic discharge safe (ESD) shields and bubble wraps.</div>
        </div>
      </div>
    </div>
  </div>

<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
