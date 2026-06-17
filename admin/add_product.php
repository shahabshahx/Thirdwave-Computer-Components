<?php
/**
 * Thirdwave Register New PC Component Listing
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

// Fetch valid categories
$cats_result = $conn->query("SELECT * FROM categories ORDER BY name ASC");

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $category_id = intval($_POST['category_id']);
    $price = floatval($_POST['price']);
    $stock_quantity = intval($_POST['stock_quantity']);
    $description = trim($_POST['description']);
    $status = trim($_POST['status']);
    
    // Validations
    if (empty($name)) {
        $errors[] = "Product name is required.";
    }
    if ($category_id <= 0) {
        $errors[] = "Please select a valid hardware category.";
    }
    if ($price <= 0) {
        $errors[] = "Please define a valid selling price standard.";
    }
    if ($stock_quantity < 0) {
        $errors[] = "Stock quantity cannot be less than zero.";
    }
    
    $image_filename = '';
    
    // Handle File Upload if provided
    if (empty($errors) && isset($_FILES['product_image']) && $_FILES['product_image']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['product_image']['tmp_name'];
        $file_name = $_FILES['product_image']['name'];
        $file_size = $_FILES['product_image']['size'];
        $file_type = $_FILES['product_image']['type'];
        
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $allowed_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (in_array($file_ext, $allowed_exts)) {
            // Setup Uploads Directory safely
            $uploads_dir = '../uploads/';
            if (!file_exists($uploads_dir)) {
                mkdir($uploads_dir, 0777, true);
            }
            
            // Give file a unique identifier name to prevent name collisions
            $image_filename = time() . '_' . rand(1000, 9999) . '.' . $file_ext;
            $dest_path = $uploads_dir . $image_filename;
            
            if (!move_uploaded_file($file_tmp, $dest_path)) {
                $errors[] = "Failed to finalize moving uploaded file to dest path folder.";
                $image_filename = '';
            }
        } else {
            $errors[] = "Unrecognized attachment format. Standard graphics formats (JPG, JPEG, PNG, WEBP, GIF) are accepted.";
        }
    }
    
    // Save to database
    if (empty($errors)) {
        $stmt = $conn->prepare("INSERT INTO products (category_id, name, description, price, stock_quantity, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("issdiss", $category_id, $name, $description, $price, $stock_quantity, $image_filename, $status);
            if ($stmt->execute()) {
                $stmt->close();
                header("Location: manage_products.php?msg=added");
                exit;
            } else {
                $errors[] = "MySQL Execution Failure: " . $stmt->error;
            }
            $stmt->close();
        } else {
            $errors[] = "Database statement prepare failed: " . $conn->error;
        }
    }
}
?>

<div style="margin-bottom: 30px;">
  <span class="admin-badge">Admin console</span>
  <h1 class="page-title" style="margin-top:5px; margin-bottom:5px;">Add <span>New Component</span></h1>
  <p class="page-subtitle" style="margin-bottom:0;">Register new graphics, storage, or memory components in the public catalog.</p>
</div>

<?php if (!empty($errors)): ?>
  <div class="alert alert-danger" id="add_errors">
    <strong>Please address errors:</strong>
    <ul style="margin-top: 5px; margin-left: 20px;">
      <?php foreach($errors as $error): ?>
        <li><?php echo htmlspecialchars($error); ?></li>
      <?php endforeach; ?>
    </ul>
  </div>
<?php endif; ?>

<div class="form-container" style="max-width: 800px; margin: 0 auto;">
  <form action="add_product.php" method="POST" enctype="multipart/form-data" id="add_product_form">
    
    <div class="form-group">
      <label class="form-label">Component Label Name</label>
      <input type="text" name="name" class="form-control form-control-block" placeholder="e.g. Intel Core i7-13700K Desktop Processor" value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>" required>
    </div>

    <div class="grid-2col" style="grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom:0;">
      <div class="form-group">
        <label class="form-label">Category</label>
        <select name="category_id" class="form-control form-control-block" required>
          <option value="0">Select Category</option>
          <?php if ($cats_result && $cats_result->num_rows > 0): ?>
            <?php while($cat = $cats_result->fetch_assoc()): ?>
              <option value="<?php echo $cat['id']; ?>" <?php echo (isset($_POST['category_id']) && intval($_POST['category_id']) === (int)$cat['id']) ? 'selected' : ''; ?>>
                <?php echo htmlspecialchars($cat['name']); ?>
              </option>
            <?php endwhile; ?>
          <?php endif; ?>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Availability Listing Status</label>
        <select name="status" class="form-control form-control-block" required>
          <option value="Available" <?php echo (isset($_POST['status']) && $_POST['status'] === 'Available') ? 'selected' : ''; ?>>Available (Listed online)</option>
          <option value="Unavailable" <?php echo (isset($_POST['status']) && $_POST['status'] === 'Unavailable') ? 'selected' : ''; ?>>Unavailable (Hidden from storefront)</option>
        </select>
      </div>
    </div>

    <div class="grid-2col" style="grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom:0;">
      <div class="form-group">
        <label class="form-label">Unit Price ($)</label>
        <input type="number" name="price" step="0.01" min="0.01" class="form-control form-control-block" placeholder="199.99" value="<?php echo isset($_POST['price']) ? htmlspecialchars($_POST['price']) : ''; ?>" required>
      </div>

      <div class="form-group">
        <label class="form-label">Stock Quantity Available</label>
        <input type="number" name="stock_quantity" min="0" class="form-control form-control-block" placeholder="10" value="<?php echo isset($_POST['stock_quantity']) ? intval($_POST['stock_quantity']) : ''; ?>" required>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Product Visual Attachment (Optional)</label>
      <input type="file" name="product_image" class="form-control form-control-block" style="padding:8px 12px; background:rgba(255,255,255,0.01); border-style:dashed;">
      <p style="font-size:11px; color:var(--text-muted); margin-top:5px;">Allowed formats: JPG, JPEG, PNG, GIF, WEBP. Maximum file size 5MB.</p>
    </div>

    <div class="form-group">
      <label class="form-label">Product Specification Description Detail</label>
      <textarea name="description" class="form-control form-control-block" placeholder="Describe architectural specifics, speeds, clock sizes, connection slots, compatibility outlines..." required><?php echo isset($_POST['description']) ? htmlspecialchars($_POST['description']) : ''; ?></textarea>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:25px;">
      <a href="manage_products.php" class="btn btn-secondary">Cancel</a>
      <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Publish Listing</button>
    </div>
  </form>
</div>

<?php require_once '../includes/footer.php'; ?>
