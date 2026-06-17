<?php
/**
 * Thirdwave Edit Existing PC Component Listing
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

$id = isset($_GET['id']) ? intval($_GET['id']) : (isset($_POST['id']) ? intval($_POST['id']) : 0);
if ($id <= 0) {
    echo "<div class='alert alert-danger'>Invalid product ID request.</div>";
    require_once '../includes/footer.php';
    exit;
}

// Fetch existing details
$stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$product = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$product) {
    echo "<div class='alert alert-danger'>Computer component record not found in database catalog slots.</div>";
    require_once '../includes/footer.php';
    exit;
}

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
        $errors[] = "Price must be greater than zero.";
    }
    if ($stock_quantity < 0) {
        $errors[] = "Stock quantity cannot be negative.";
    }
    
    $image_filename = $product['image']; // Default to retaining old image
    
    // Handle File Upload if provided
    if (empty($errors) && isset($_FILES['product_image']) && $_FILES['product_image']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['product_image']['tmp_name'];
        $file_name = $_FILES['product_image']['name'];
        
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $allowed_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (in_array($file_ext, $allowed_exts)) {
            $uploads_dir = '../uploads/';
            if (!file_exists($uploads_dir)) {
                mkdir($uploads_dir, 0777, true);
            }
            
            // Generate unique filename
            $new_filename = time() . '_' . rand(1000, 9999) . '.' . $file_ext;
            $dest_path = $uploads_dir . $new_filename;
            
            if (move_uploaded_file($file_tmp, $dest_path)) {
                // Delete previous image from drive if exists
                if (!empty($product['image']) && file_exists($uploads_dir . $product['image'])) {
                    @unlink($uploads_dir . $product['image']);
                }
                $image_filename = $new_filename;
            } else {
                $errors[] = "Failed to finalize moving uploaded file to server filesystem space.";
            }
        } else {
            $errors[] = "Unrecognized attachment format. Standard graphics formats are accepted.";
        }
    }
    
    // Update Database record
    if (empty($errors)) {
        $update_stmt = $conn->prepare("UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, stock_quantity = ?, image = ?, status = ? WHERE id = ?");
        if ($update_stmt) {
            $update_stmt->bind_param("issdissi", $category_id, $name, $description, $price, $stock_quantity, $image_filename, $status, $id);
            if ($update_stmt->execute()) {
                $update_stmt->close();
                header("Location: manage_products.php?msg=edited");
                exit;
            } else {
                $errors[] = "MySQL Execution Failure: " . $update_stmt->error;
            }
            $update_stmt->close();
        } else {
            $errors[] = "Database statement prepare failed: " . $conn->error;
        }
    }
}
?>

<div style="margin-bottom: 30px;">
  <span class="admin-badge">Admin console</span>
  <h1 class="page-title" style="margin-top:5px; margin-bottom:5px;">Edit <span>Component Details</span></h1>
  <p class="page-subtitle" style="margin-bottom:0;">Adjust metadata, prices, image mappings, and stock levels for listings.</p>
</div>

<?php if (!empty($errors)): ?>
  <div class="alert alert-danger" id="edit_errors">
    <strong>Please address errors:</strong>
    <ul style="margin-top: 5px; margin-left: 20px;">
      <?php foreach($errors as $error): ?>
        <li><?php echo htmlspecialchars($error); ?></li>
      <?php endforeach; ?>
    </ul>
  </div>
<?php endif; ?>

<div class="form-container" style="max-width: 800px; margin: 0 auto;">
  <form action="edit_product.php" method="POST" enctype="multipart/form-data" id="edit_product_form">
    <input type="hidden" name="id" value="<?php echo $product['id']; ?>">
    
    <div class="form-group">
      <label class="form-label">Component Label Name</label>
      <input type="text" name="name" class="form-control form-control-block" value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : htmlspecialchars($product['name']); ?>" required>
    </div>

    <div class="grid-2col" style="grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom:0;">
      <div class="form-group">
        <label class="form-label">Category</label>
        <select name="category_id" class="form-control form-control-block" required>
          <option value="0">Select Category</option>
          <?php if ($cats_result && $cats_result->num_rows > 0): ?>
            <?php while($cat = $cats_result->fetch_assoc()): ?>
              <?php 
                $selected_cat_id = isset($_POST['category_id']) ? intval($_POST['category_id']) : (int)$product['category_id'];
              ?>
              <option value="<?php echo $cat['id']; ?>" <?php echo ($selected_cat_id === (int)$cat['id']) ? 'selected' : ''; ?>>
                <?php echo htmlspecialchars($cat['name']); ?>
              </option>
            <?php endwhile; ?>
          <?php endif; ?>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Availability Listing Status</label>
        <select name="status" class="form-control form-control-block" required>
          <?php 
            $current_status = isset($_POST['status']) ? trim($_POST['status']) : $product['status'];
          ?>
          <option value="Available" <?php echo ($current_status === 'Available') ? 'selected' : ''; ?>>Available (Listed online)</option>
          <option value="Unavailable" <?php echo ($current_status === 'Unavailable') ? 'selected' : ''; ?>>Unavailable (Hidden from storefront)</option>
        </select>
      </div>
    </div>

    <div class="grid-2col" style="grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom:0;">
      <div class="form-group">
        <label class="form-label">Unit Price ($)</label>
        <input type="number" name="price" step="0.01" min="0.01" class="form-control form-control-block" value="<?php echo isset($_POST['price']) ? htmlspecialchars($_POST['price']) : $product['price']; ?>" required>
      </div>

      <div class="form-group">
        <label class="form-label">Stock Quantity Available</label>
        <input type="number" name="stock_quantity" min="0" class="form-control form-control-block" value="<?php echo isset($_POST['stock_quantity']) ? intval($_POST['stock_quantity']) : $product['stock_quantity']; ?>" required>
      </div>
    </div>

    <!-- Active Image Preview Sheet -->
    <div style="margin: 20px 0; padding:15px; background:rgba(255,255,255,0.02); border-radius:6px; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px;">
      <div style="width: 80px; height: 80px; background-color: #1a2236; border-radius: 4px; display:flex; align-items:center; justify-content:center; overflow:hidden; border:1px solid var(--border-color); flex-shrink:0;">
        <?php if (!empty($product['image']) && file_exists('../uploads/' . $product['image'])): ?>
          <img src="../uploads/<?php echo htmlspecialchars($product['image']); ?>" style="max-width:100%; max-height:100%; object-fit:cover;" alt="Current product visual mapping">
        <?php else: ?>
          <i data-lucide="image" style="width:28px; height:28px; color:var(--text-muted);"></i>
        <?php endif; ?>
      </div>
      <div>
        <h4 style="font-size:14px; margin-bottom:4px;">Existing Visual Block</h4>
        <p style="font-size:11px; color:var(--text-muted);"><?php echo empty($product['image']) ? 'No active image fallback configured.' : 'File mapping: <code>' . htmlspecialchars($product['image']) . '</code>'; ?></p>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Upload New Product Visual (Leave blank to keep current)</label>
      <input type="file" name="product_image" class="form-control form-control-block" style="padding:8px 12px; background:rgba(255,255,255,0.01); border-style:dashed;">
      <p style="font-size:11px; color:var(--text-muted); margin-top:5px;">Allowed formats: JPG, JPEG, PNG, GIF, WEBP. Maximum file size 5MB.</p>
    </div>

    <div class="form-group">
      <label class="form-label">Product Specification Description Detail</label>
      <textarea name="description" class="form-control form-control-block" required><?php echo isset($_POST['description']) ? htmlspecialchars($_POST['description']) : htmlspecialchars($product['description']); ?></textarea>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:25px;">
      <a href="manage_products.php" class="btn btn-secondary">Cancel</a>
      <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Save Product Adjustments</button>
    </div>
  </form>
</div>

<?php require_once '../includes/footer.php'; ?>
