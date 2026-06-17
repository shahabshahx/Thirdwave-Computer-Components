<?php
/**
 * Thirdwave Products List
 */
require_once 'includes/db.php';
require_once 'includes/header.php';

// Fetch all categories for the filter select dropdown list
$categories_query = "SELECT * FROM categories ORDER BY name ASC";
$categories_result = $conn->query($categories_query);

// Formulate sql search / categories filters
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$category_filter = isset($_GET['category']) ? intval($_GET['category']) : 0;

$sql = "SELECT p.*, c.name AS category_name FROM products p 
        JOIN categories c ON p.category_id = c.id WHERE 1=1";

// Bind params array
$bind_types = "";
$bind_params = [];

if (!empty($search)) {
    $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
    $search_term = "%" . $search . "%";
    $bind_types .= "ss";
    $bind_params[] = $search_term;
    $bind_params[] = $search_term;
}

if ($category_filter > 0) {
    $sql .= " AND p.category_id = ?";
    $bind_types .= "i";
    $bind_params[] = $category_filter;
}

$sql .= " ORDER BY p.id DESC";

// Execute prepared query to avoid SQL injection
$stmt = $conn->prepare($sql);
if ($stmt) {
    if (!empty($bind_types)) {
        $stmt->bind_param($bind_types, ...$bind_params);
    }
    $stmt->execute();
    $products_result = $stmt->get_result();
} else {
    $products_result = $conn->query($sql);
}
?>

<div style="margin-bottom: 30px;">
  <h1 class="page-title">Verified <span>Components Catalog</span></h1>
  <p class="page-subtitle">Thoroughly inspected, cleaned, benchmarked, and ready for shipment.</p>
</div>

<!-- Search and Category Filters Panel -->
<div class="shop-controls" id="shop_controls">
  <form action="products.php" method="GET" class="search-form">
    <input type="text" name="search" placeholder="Search components, CPUs, RAM..." class="form-control" style="flex-grow:1;" value="<?php echo htmlspecialchars($search); ?>">
    
    <select name="category" class="form-control" onchange="this.form.submit()">
      <option value="0">All Categories</option>
      <?php if ($categories_result && $categories_result->num_rows > 0): ?>
        <?php while($cat = $categories_result->fetch_assoc()): ?>
          <option value="<?php echo $cat['id']; ?>" <?php echo ($category_filter === (int)$cat['id']) ? 'selected' : ''; ?>>
            <?php echo htmlspecialchars($cat['name']); ?>
          </option>
        <?php endwhile; ?>
      <?php endif; ?>
    </select>

    <button type="submit" class="btn btn-primary"><i data-lucide="search" style="width:16px; height:16px;"></i> Filter</button>
    <?php if (!empty($search) || $category_filter > 0): ?>
      <a href="products.php" class="btn btn-secondary" title="Clear Filters"><i data-lucide="x" style="width:16px; height:16px;"></i> Clear</a>
    <?php endif; ?>
  </form>
</div>

<!-- Product Listing Grid -->
<div class="products-grid">
  <?php if ($products_result && $products_result->num_rows > 0): ?>
    <?php while($product = $products_result->fetch_assoc()): ?>
      <div class="product-card" id="prod_card_<?php echo $product['id']; ?>">
        <div class="product-image-container">
          <span class="category-tag"><?php echo htmlspecialchars($product['category_name']); ?></span>
          <span class="stock-status <?php echo ($product['stock_quantity'] > 0) ? 'stock-in' : 'stock-out'; ?>">
            <?php echo ($product['stock_quantity'] > 0) ? 'In Stock (' . $product['stock_quantity'] . ')' : 'Out of Stock'; ?>
          </span>
          <?php if (!empty($product['image']) && file_exists('uploads/' . $product['image'])): ?>
            <img src="uploads/<?php echo htmlspecialchars($product['image']); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>" class="product-img">
          <?php else: ?>
            <div class="image-fallback">
              <i data-lucide="package" style="width: 48px; height: 48px;"></i>
              <span><?php echo htmlspecialchars($product['name']); ?></span>
            </div>
          <?php endif; ?>
        </div>
        <div class="product-info">
          <h3 class="product-name" title="<?php echo htmlspecialchars($product['name']); ?>"><?php echo htmlspecialchars($product['name']); ?></h3>
          <p class="product-desc"><?php echo htmlspecialchars($product['description']); ?></p>
          <div class="product-footer">
            <span class="product-price">$<?php echo number_format($product['price'], 2); ?></span>
            <?php if ($product['stock_quantity'] > 0): ?>
              <a href="order.php?product_id=<?php echo $product['id']; ?>" class="btn btn-primary btn-sm">
                <i data-lucide="shopping-cart" style="width:14px; height:14px;"></i> Buy Now
              </a>
            <?php else: ?>
              <button class="btn btn-secondary btn-sm" style="opacity: 0.5; cursor: not-allowed;" disabled>
                <i data-lucide="slash" style="width:14px; height:14px;"></i> Sold Out
              </button>
            <?php endif; ?>
          </div>
        </div>
      </div>
    <?php endwhile; ?>
  <?php else: ?>
    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background-color: var(--bg-card); border: 1px dashed var(--border-color); border-radius: 8px;">
      <i data-lucide="help-circle" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 15px;"></i>
      <h3 style="margin-bottom: 5px;">No matching components</h3>
      <p style="color: var(--text-muted); font-size:14px; max-width: 400px; margin: 0 auto 15px;">We couldn't find any listings matching your search parameters. Please try adjusting your filter or search keyword.</p>
      <a href="products.php" class="btn btn-primary btn-sm">Reset Catalog View</a>
    </div>
  <?php endif; ?>
</div>

<?php 
if (isset($stmt)) {
    $stmt->close();
}
require_once 'includes/footer.php'; 
?>
