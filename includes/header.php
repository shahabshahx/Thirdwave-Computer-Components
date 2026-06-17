<?php
/**
 * Thirdwave Page Header Block
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Helper to determine active class
function is_active($page) {
    $current_script = basename($_SERVER['SCRIPT_NAME']);
    return ($current_script === $page) ? 'active' : '';
}

// Setup base url logic for admin relative files
$is_admin_folder = strpos($_SERVER['SCRIPT_NAME'], '/admin/') !== false;
$base_prefix = $is_admin_folder ? '../' : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thirdwave - Computer Components Hub</title>
  <link rel="stylesheet" href="<?php echo $base_prefix; ?>css/style.css">
  <!-- Lucide Icons Web CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>

<header class="site-header" id="site_header">
  <div class="nav-container">
    <a href="<?php echo $base_prefix; ?>index.php" class="logo" id="logo">
      <i data-lucide="cpu" style="width: 28px; height: 28px; color: #3b82f6;"></i>
      THIRDWAVE
    </a>

    <nav>
      <ul class="nav-menu">
        <li><a href="<?php echo $base_prefix; ?>index.php" class="nav-link <?php echo is_active('index.php'); ?>">Home</a></li>
        <li><a href="<?php echo $base_prefix; ?>products.php" class="nav-link <?php echo is_active('products.php'); ?>">Products</a></li>
        <li><a href="<?php echo $base_prefix; ?>sell.php" class="nav-link <?php echo is_active('sell.php'); ?>">Sell Component</a></li>
        <li><a href="<?php echo $base_prefix; ?>about.php" class="nav-link <?php echo is_active('about.php'); ?>">About Us</a></li>
        <li><a href="<?php echo $base_prefix; ?>contact.php" class="nav-link <?php echo is_active('contact.php'); ?>">Contact</a></li>
        
        <?php if (isset($_SESSION['admin'])): ?>
          <li><span class="admin-badge">Admin Mode</span></li>
          <li><a href="<?php echo $base_prefix; ?>admin/dashboard.php" class="nav-link <?php echo $is_admin_folder ? 'active' : ''; ?>" style="color: #3b82f6;">Dashboard</a></li>
          <li><a href="<?php echo $base_prefix; ?>admin/logout.php" class="nav-btn" style="background-color: #ef4444;"><i data-lucide="log-out" style="display:inline-block; vertical-align:middle; width:14px; height:14px; margin-right:4px;"></i> Logout</a></li>
        <?php else: ?>
          <li><a href="<?php echo $base_prefix; ?>login.php" class="nav-link <?php echo is_active('login.php'); ?>"><i data-lucide="lock" style="display:inline-block; vertical-align:middle; width:14px; height:14px; margin-right:4px;"></i> Admin Area</a></li>
        <?php endif; ?>
      </ul>
    </nav>
  </div>
</header>

<main class="main-content">
