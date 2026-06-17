<?php
/**
 * Thirdwave Homepage
 */
require_once 'includes/db.php';
require_once 'includes/header.php';

// Fetch 3 random or featured products for display from products join categories
$featured_query = "SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.status = 'Available' ORDER BY p.id DESC LIMIT 3";
$featured_result = $conn->query($featured_query);
?>

<div class="hero" id="home_hero">
  <h1>Buy & Sell <span>Computer Components</span> with Trust</h1>
  <p>Welcome to Thirdwave – your premier tech marketplace. Upgrade your gaming or productivity rig with verified parts, or sell your used components for immediate payouts.</p>
  <div class="hero-actions">
    <a href="products.php" class="btn btn-primary" id="btn_shop"><i data-lucide="shopping-cart"></i> View Products</a>
    <a href="sell.php" class="btn btn-secondary" id="btn_sell"><i data-lucide="sparkles"></i> Sell Component</a>
  </div>
</div>

<h2 class="section-title text-center" style="text-align: center; font-size: 24px; margin-bottom: 30px;">How It Works</h2>
<div class="features-grid">
  <div class="feature-card" id="feat_buy">
    <div class="feature-icon"><i data-lucide="shield-check"></i></div>
    <h3>Secure Buying</h3>
    <p>Browse our catalog of thoroughly inspected GPUs, CPUs, Motherboards, RAM, and more. Backed by stock verification and instant processing.</p>
  </div>
  <div class="feature-card" id="feat_sell">
    <div class="feature-icon"><i data-lucide="coins"></i></div>
    <h3>Instant Appraisals</h3>
    <p>Submit details of your used parts. Enter your expected pricing, description, and condition to get quick offers from our review team.</p>
  </div>
  <div class="feature-card" id="feat_support">
    <div class="feature-icon"><i data-lucide="headset"></i></div>
    <h3>Premium Service</h3>
    <p>Dedicated staff support to guide your custom PC build specs or coordinate trades and shipments. We handle the complexity for you.</p>
  </div>
</div>

<div class="featured-section" style="margin-top: 60px;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
    <h2 style="font-size: 24px; margin: 0;">Featured Components</h2>
    <a href="products.php" style="color: #3b82f6; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 4px;">Explore Catalog <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i></a>
  </div>

  <div class="products-grid">
    <?php if ($featured_result && $featured_result->num_rows > 0): ?>
      <?php while($row = $featured_result->fetch_assoc()): ?>
        <div class="product-card" id="prod_card_<?php echo $row['id']; ?>">
          <div class="product-image-container">
            <span class="category-tag"><?php echo htmlspecialchars($row['category_name']); ?></span>
            <span class="stock-status <?php echo ($row['stock_quantity'] > 0) ? 'stock-in' : 'stock-out'; ?>">
              <?php echo ($row['stock_quantity'] > 0) ? 'In Stock' : 'Out of Stock'; ?>
            </span>
            <?php if (!empty($row['image']) && file_exists('uploads/' . $row['image'])): ?>
              <img src="uploads/<?php echo htmlspecialchars($row['image']); ?>" alt="<?php echo htmlspecialchars($row['name']); ?>" class="product-img">
            <?php else: ?>
              <div class="image-fallback">
                <i data-lucide="package" style="width: 48px; height: 48px;"></i>
                <span><?php echo htmlspecialchars($row['name']); ?></span>
              </div>
            <?php endif; ?>
          </div>
          <div class="product-info">
            <h3 class="product-name"><?php echo htmlspecialchars($row['name']); ?></h3>
            <p class="product-desc"><?php echo htmlspecialchars($row['description']); ?></p>
            <div class="product-footer">
              <span class="product-price">$<?php echo number_format($row['price'], 2); ?></span>
              <a href="order.php?product_id=<?php echo $row['id']; ?>" class="btn btn-primary btn-sm <?php echo ($row['stock_quantity'] <= 0) ? 'disabled' : ''; ?>" style="<?php echo ($row['stock_quantity'] <= 0) ? 'pointer-events: none; opacity: 0.5;' : ''; ?>">
                <i data-lucide="shopping-cart" style="width:14px; height:14px;"></i> Buy Now
              </a>
            </div>
          </div>
        </div>
      <?php endwhile; ?>
    <?php else: ?>
      <p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1;">No featured components found. Please run database.sql setup to seed catalog items!</p>
    <?php endif; ?>
  </div>
</div>

<?php require_once 'includes/footer.php'; ?>
