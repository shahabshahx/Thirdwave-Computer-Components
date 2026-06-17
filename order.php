<?php
/**
 * Thirdwave Order Form / Checkout Sheet
 */
require_once 'includes/db.php';
require_once 'includes/header.php';

// Retrieve selected product
$product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : (isset($_POST['product_id']) ? intval($_POST['product_id']) : 0);
$product = null;

if ($product_id > 0) {
    $stmt = $conn->prepare("SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?");
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc();
    $stmt->close();
}

$errors = [];
$success = false;
$order_number = 0;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $customer_name = trim($_POST['customer_name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone']);
    $address = trim($_POST['address']);
    $quantity = intval($_POST['quantity']);
    
    // Validation Checks
    if (empty($customer_name)) {
        $errors[] = "Customer Name is required.";
    }
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Please provide a valid shipping Email address.";
    }
    if (empty($phone)) {
        $errors[] = "A contact Phone number is required for coordinating delivery.";
    }
    if (empty($address)) {
        $errors[] = "Complete Shipping Address is required.";
    }
    if ($quantity <= 0) {
        $errors[] = "Please select a valid quantity of 1 or more.";
    }
    
    if (!$product) {
        $errors[] = "No valid product is selected. Please return to the catalog and select a component.";
    } else {
        if ($quantity > $product['stock_quantity']) {
            $errors[] = "Insufficient stock. Only " . $product['stock_quantity'] . " units are available for " . htmlspecialchars($product['name']) . ".";
        }
    }
    
    // If no validation errors, proceed with processing order
    if (empty($errors)) {
        $conn->begin_transaction();
        try {
            $total_price = $product['price'] * $quantity;
            $status = 'Pending';
            
            // Insert order details
            $order_stmt = $conn->prepare("INSERT INTO orders (product_id, customer_name, email, phone, address, quantity, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $order_stmt->bind_param("issssiis", $product_id, $customer_name, $email, $phone, $address, $quantity, $total_price, $status);
            $order_stmt->execute();
            $order_number = $conn->insert_id;
            $order_stmt->close();
            
            // Deduct stock from products table
            $new_stock = $product['stock_quantity'] - $quantity;
            $update_stmt = $conn->prepare("UPDATE products SET stock_quantity = ? WHERE id = ?");
            $update_stmt->bind_param("ii", $new_stock, $product_id);
            $update_stmt->execute();
            $update_stmt->close();
            
            // Commit Transaction
            $conn->commit();
            $success = true;
            
            // Reload product details to show updated stock limits if they order again
            $product['stock_quantity'] = $new_stock;
        } catch (Exception $e) {
            $conn->rollback();
            $errors[] = "System Error processing order: " . $e->getMessage();
        }
    }
}
?>

<div style="margin-bottom: 30px;">
  <h1 class="page-title">Assemble <span>Your Order</span></h1>
  <p class="page-subtitle">Verify details and submit. Our logistics desk will process it immediately.</p>
</div>

<?php if ($success): ?>
  <div class="alert alert-success" style="padding:30px; text-align:center;" id="order_success">
    <i data-lucide="check-circle" style="width: 56px; height: 56px; color:#10b981; margin: 0 auto 15px; display:block;"></i>
    <h2 style="margin-bottom:10px;">Order Placed Successfully!</h2>
    <p style="margin-bottom: 20px;">Thank you for shopping with Thirdwave. Your transaction has been registered under invoice <strong>#TW-<?php echo $order_number; ?></strong>. We will coordinate shipment details via your email address.</p>
    <div style="display:flex; justify-content:center; gap: 10px;">
      <a href="products.php" class="btn btn-primary btn-sm">Explore More Parts</a>
      <a href="index.php" class="btn btn-secondary btn-sm">Go to Homepage</a>
    </div>
  </div>
<?php else: ?>

  <?php if (!empty($errors)): ?>
    <div class="alert alert-danger" id="order_errors">
      <strong>Please correct the following errors:</strong>
      <ul style="margin-top: 5px; margin-left: 20px;">
        <?php foreach($errors as $error): ?>
          <li><?php echo htmlspecialchars($error); ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
  <?php endif; ?>

  <?php if ($product): ?>
    <div class="grid-2col">
      <!-- Checkout Details Form -->
      <div class="form-container" style="max-width:100%; margin:0;">
        <h2 style="font-size:20px; border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:20px;"><i data-lucide="user" style="display:inline-block; vertical-align:middle; width:18px; margin-right:5px;"></i> Shipping Information</h2>
        
        <form action="order.php" method="POST" id="order_form">
          <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>">
          
          <div class="form-group">
            <label class="form-label">Full Customer Name</label>
            <input type="text" name="customer_name" class="form-control form-control-block" placeholder="John Doe" value="<?php echo isset($_POST['customer_name']) ? htmlspecialchars($_POST['customer_name']) : ''; ?>" required>
          </div>
          
          <div class="grid-2col" style="grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom:0;">
            <div class="form-group">
              <label class="form-label">E-mail Address</label>
              <input type="email" name="email" class="form-control form-control-block" placeholder="johndoe@example.com" value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Contact Phone Number</label>
              <input type="text" name="phone" class="form-control form-control-block" placeholder="+1 (555) 0199" value="<?php echo isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : ''; ?>" required>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Delivery Shipping Address</label>
            <textarea name="address" class="form-control form-control-block" placeholder="Street, Building, Apartment, ZIP Code, City, Country" required><?php echo isset($_POST['address']) ? htmlspecialchars($_POST['address']) : ''; ?></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Order Quantity (Available stock: <?php echo $product['stock_quantity']; ?> units)</label>
            <input type="number" name="quantity" id="quantity_input" min="1" max="<?php echo $product['stock_quantity']; ?>" value="<?php echo isset($_POST['quantity']) ? intval($_POST['quantity']) : 1; ?>" class="form-control" style="width: 120px;" oninput="updateTotal(this.value)">
          </div>
          
          <button type="submit" class="btn btn-primary btn-block" style="margin-top: 25px;"><i data-lucide="shopping-bag"></i> Commit Order Invoice</button>
        </form>
      </div>
      
      <!-- Order Summary Card -->
      <div class="order-summary-card">
        <h2 style="font-size:18px; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:10px;"><i data-lucide="clipboard-list" style="display:inline-block; vertical-align:middle; width:18px; margin-right:5px;"></i> Order Invoice Summary</h2>
        
        <div style="text-align: center; margin-bottom: 20px; background-color: rgba(255,255,255,0.02); padding: 15px; border-radius: 6px;">
          <?php if (!empty($product['image']) && file_exists('uploads/' . $product['image'])): ?>
            <img src="uploads/<?php echo htmlspecialchars($product['image']); ?>" style="max-width:120px; max-height:120px; margin-bottom:10px;" alt="">
          <?php else: ?>
            <i data-lucide="cpu" style="width:48px; height:48px; color:var(--accent-color); margin: 0 auto 10px; display:block;"></i>
          <?php endif; ?>
          <h3 style="font-size:16px; margin:0;"><?php echo htmlspecialchars($product['name']); ?></h3>
          <span class="category-tag" style="position:static; margin-top:5px; display:inline-block;"><?php echo htmlspecialchars($product['category_name']); ?></span>
        </div>
        
        <div class="summary-row">
          <span>Component Unit Price:</span>
          <span>$<?php echo number_format($product['price'], 2); ?></span>
        </div>
        <div class="summary-row">
          <span>Selected Quantity:</span>
          <span id="summary_quantity">1</span>
        </div>
        <div class="summary-row">
          <span>Taxes & Handling:</span>
          <span style="color:#10b981;">FREE</span>
        </div>
        <div class="summary-row" style="margin-top:15px;">
          <span>Grand Total:</span>
          <span id="summary_total">$<?php echo number_format($product['price'], 2); ?></span>
        </div>
      </div>
    </div>

    <script>
      // Automatically update the summary total is quantity changes!
      const unitPrice = <?php echo $product['price']; ?>;
      function updateTotal(qty) {
        qty = parseInt(qty) || 1;
        document.getElementById('summary_quantity').innerText = qty;
        const total = (qty * unitPrice).toFixed(2);
        document.getElementById('summary_total').innerText = '$' + Number(total).toLocaleString();
      }
      // Initialize layout count
      updateTotal(document.getElementById('quantity_input').value);
    </script>

  <?php else: ?>
    <div style="text-align: center; padding: 60px 40px; background-color: var(--bg-card); border: 1px dashed var(--border-color); border-radius: 8px;">
      <i data-lucide="alert-triangle" style="width: 56px; height: 56px; color: var(--warning-color); margin: 0 auto 15px; display:block;"></i>
      <h3 style="margin-bottom: 10px;">No Product Selected</h3>
      <p style="color: var(--text-muted); font-size:14px; max-width: 450px; margin: 0 auto 20px;">In order to place an order, you must first select a product from our catalog.</p>
      <a href="products.php" class="btn btn-primary"><i data-lucide="shopping-cart"></i> Go to Products Catalog</a>
    </div>
  <?php endif; ?>

<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
