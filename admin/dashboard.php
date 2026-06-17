<?php
/**
 * Thirdwave Admin Control Center Index
 */
require_once '../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// Protect page
if (!isset($_SESSION['admin'])) {
    header("Location: ../login.php");
    exit;
}

require_once '../includes/header.php';

// Fetch Count Statistics for Widgets
$total_products = 0;
$total_orders = 0;
$total_sell_requests = 0;
$total_messages = 0;

$res1 = $conn->query("SELECT COUNT(*) AS total FROM products");
if ($res1) { $total_products = $res1->fetch_assoc()['total']; }

$res2 = $conn->query("SELECT COUNT(*) AS total FROM orders");
if ($res2) { $total_orders = $res2->fetch_assoc()['total']; }

$res3 = $conn->query("SELECT COUNT(*) AS total FROM sell_requests");
if ($res3) { $total_sell_requests = $res3->fetch_assoc()['total']; }

$res4 = $conn->query("SELECT COUNT(*) AS total FROM contact_messages");
if ($res4) { $total_messages = $res4->fetch_assoc()['total']; }
?>

<div style="margin-bottom: 40px;">
  <span class="admin-badge" style="margin-bottom: 10px; display:inline-block;">Superuser Terminal</span>
  <h1 class="page-title">Administrative <span>Dashboard</span></h1>
  <p class="page-subtitle">Welcome back, <strong><?php echo htmlspecialchars($_SESSION['admin_fullname']); ?></strong>. View business telemetry and manage systems from here.</p>
</div>

<!-- Admin Telemetry Stat Grid -->
<div class="dashboard-grid">
  <div class="dashboard-stat-card" id="stat_products">
    <div class="stat-icon"><i data-lucide="package"></i></div>
    <div class="stat-info">
      <span class="stat-val"><?php echo $total_products; ?></span>
      <span class="stat-lbl">Active Products</span>
    </div>
  </div>

  <div class="dashboard-stat-card" id="stat_orders">
    <div class="stat-icon" style="background-color: rgba(16, 185, 129, 0.1); color: var(--success-color);"><i data-lucide="shopping-cart"></i></div>
    <div class="stat-info">
      <span class="stat-val"><?php echo $total_orders; ?></span>
      <span class="stat-lbl">Total Orders</span>
    </div>
  </div>

  <div class="dashboard-stat-card" id="stat_sell">
    <div class="stat-icon" style="background-color: rgba(245, 158, 11, 0.1); color: var(--warning-color);"><i data-lucide="coins"></i></div>
    <div class="stat-info">
      <span class="stat-val"><?php echo $total_sell_requests; ?></span>
      <span class="stat-lbl">Sell Requests</span>
    </div>
  </div>

  <div class="dashboard-stat-card" id="stat_messages">
    <div class="stat-icon" style="background-color: rgba(139, 92, 246, 0.1); color: #a78bfa;"><i data-lucide="messages-square"></i></div>
    <div class="stat-info">
      <span class="stat-val"><?php echo $total_messages; ?></span>
      <span class="stat-lbl">Inquiries</span>
    </div>
  </div>
</div>

<!-- Quick Link Dashboard Controls -->
<h2 style="font-size: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;"><i data-lucide="grid-3X3" style="display:inline-block; vertical-align:middle; width:18px; margin-right:5px;"></i> Management Services</h2>
<div class="features-grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-bottom: 40px;">
  <div class="feature-card" style="padding:25px;" id="card_manage_products">
    <div class="feature-icon" style="font-size:24px;"><i data-lucide="boxes" style="width:28px; height:28px;"></i></div>
    <h3 style="font-size: 18px; margin-bottom: 8px;">Catalog Management</h3>
    <p style="margin-bottom:15px; font-size:13px; line-height:1.5;">Add components, adjust models, update descriptions, alter prices, and control active listings.</p>
    <a href="manage_products.php" class="btn btn-primary btn-sm btn-block">Enter Catalog Portal</a>
  </div>

  <div class="feature-card" style="padding:25px;" id="card_manage_orders">
    <div class="feature-icon" style="font-size:24px; color: var(--success-color);"><i data-lucide="receipt" style="width:28px; height:28px;"></i></div>
    <h3 style="font-size: 18px; margin-bottom: 8px;">Customer Orders</h3>
    <p style="margin-bottom:15px; font-size:13px; line-height:1.5;">Track incoming orders, adjust progress status (Pending to Shipped), view customer shipping logs.</p>
    <a href="manage_orders.php" class="btn btn-primary btn-sm btn-block" style="background-color: var(--success-color);">View Customer Invoices</a>
  </div>

  <div class="feature-card" style="padding:25px;" id="card_sell_requests">
    <div class="feature-icon" style="font-size:24px; color: var(--warning-color);"><i data-lucide="handshake" style="width:28px; height:28px;"></i></div>
    <h3 style="font-size: 18px; margin-bottom: 8px;">Traders & Liquidations</h3>
    <p style="margin-bottom:15px; font-size:13px; line-height:1.5;">Inspect component proposals uploaded by users (condition, target price), tag reviews, approve offers.</p>
    <a href="sell_requests.php" class="btn btn-primary btn-sm btn-block" style="background-color: var(--warning-color);">Manage Trade Requests</a>
  </div>

  <div class="feature-card" style="padding:25px;" id="card_messages">
    <div class="feature-icon" style="font-size:24px; color: #a78bfa;"><i data-lucide="mail" style="width:28px; height:28px;"></i></div>
    <h3 style="font-size: 18px; margin-bottom: 8px;">Help Desk Tickets</h3>
    <p style="margin-bottom:15px; font-size:13px; line-height:1.5;">Read incoming custom suggestions, compatible inquiries, general reviews and clean processed logs.</p>
    <a href="messages.php" class="btn btn-primary btn-sm btn-block" style="background-color: #8b5cf6;">Read Ticket Inbox</a>
  </div>
</div>

<?php require_once '../includes/footer.php'; ?>
