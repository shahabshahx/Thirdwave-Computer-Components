<?php
/**
 * Thirdwave Catalog Inventory Table Management
 */
require_once '../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// Protection block
if (!isset($_SESSION['admin'])) {
    header("Location: ../login.php");
    exit;
}

require_once '../includes/header.php';

// Fetch all catalog items with category labels
$sql = "SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC";
$result = $conn->query($sql);

$msg = isset($_GET['msg']) ? trim($_GET['msg']) : '';
$err = isset($_GET['err']) ? trim($_GET['err']) : '';
?>

<div class="admin-header-actions" id="manage_products_header">
  <div>
    <span class="admin-badge">Inventory Engine</span>
    <h1 class="page-title" style="margin-top:5px; margin-bottom:5px;">Manage <span>Products</span></h1>
    <p class="page-subtitle" style="margin-bottom:0;">Inject components, edit listings, adjust stock quotas, & manage availability.</p>
  </div>
  <a href="add_product.php" class="btn btn-primary"><i data-lucide="plus-circle"></i> Add Component</a>
</div>

<?php if ($msg === 'added'): ?>
  <div class="alert alert-success">Component added to store catalog successfully.</div>
<?php elseif ($msg === 'edited'): ?>
  <div class="alert alert-success">Component details adjusted and updated.</div>
<?php elseif ($msg === 'deleted'): ?>
  <div class="alert alert-success">Component deleted from inventory catalog successfully.</div>
<?php endif; ?>

<?php if (!empty($err)): ?>
  <div class="alert alert-danger"><?php echo htmlspecialchars($err); ?></div>
<?php endif; ?>

<div class="table-responsive">
  <table class="table" id="products_table">
    <thead>
      <tr>
        <th style="width: 70px;">ID</th>
        <th style="width: 100px;">Visual</th>
        <th>Component Name</th>
        <th>Category</th>
        <th>Unit Price</th>
        <th style="width: 100px;">Stock</th>
        <th>Status</th>
        <th style="width: 180px; text-align: center;">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php if ($result && $result->num_rows > 0): ?>
        <?php while($row = $result->fetch_assoc()): ?>
          <tr id="row_prod_<?php echo $row['id']; ?>">
            <td style="font-family: var(--font-mono); font-size:12px;">#TW-P<?php echo $row['id']; ?></td>
            <td>
              <div style="width: 60px; height: 60px; background-color: #1a2236; border-radius: 4px; display:flex; align-items:center; justify-content:center; overflow:hidden; border:1px solid var(--border-color);">
                <?php if (!empty($row['image']) && file_exists('../uploads/' . $row['image'])): ?>
                  <img src="../uploads/<?php echo htmlspecialchars($row['image']); ?>" style="max-width:100%; max-height:100%; object-fit:cover;" alt="">
                <?php else: ?>
                  <i data-lucide="image" style="width:20px; height:20px; color:var(--text-muted);"></i>
                <?php endif; ?>
              </div>
            </td>
            <td>
              <strong style="font-size:14px; display:block; color:#f8fafc;"><?php echo htmlspecialchars($row['name']); ?></strong>
              <span style="font-size:11px; color:var(--text-muted); display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;" title="<?php echo htmlspecialchars($row['description']); ?>">
                <?php echo htmlspecialchars($row['description']); ?>
              </span>
            </td>
            <td><span class="category-tag" style="position:static;"><?php echo htmlspecialchars($row['category_name']); ?></span></td>
            <td style="font-family: var(--font-mono); font-weight:600; color:#3b82f6;">$<?php echo number_format($row['price'], 2); ?></td>
            <td style="font-family: var(--font-mono); text-align:center;"><?php echo $row['stock_quantity']; ?></td>
            <td>
              <span class="badge <?php echo ($row['status'] === 'Available' && $row['stock_quantity'] > 0) ? 'badge-delivered' : 'badge-cancelled'; ?>">
                <?php echo ($row['stock_quantity'] <= 0) ? 'Sold Out' : htmlspecialchars($row['status']); ?>
              </span>
            </td>
            <td>
              <div class="action-cell" style="justify-content: center;">
                <a href="edit_product.php?id=<?php echo $row['id']; ?>" class="btn btn-secondary btn-sm" title="Edit Component Details"><i data-lucide="edit-3" style="width:14px; height:14px;"></i> Edit</a>
                <a href="delete_product.php?id=<?php echo $row['id']; ?>" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this product? It will automatically cancel any referenced customer invoices!')" title="Delete Component"><i data-lucide="trash-2" style="width:14px; height:14px;"></i> Delete</a>
              </div>
            </td>
          </tr>
        <?php endwhile; ?>
      <?php else: ?>
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
            <i data-lucide="folder-open" style="width:36px; height:36px; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto;"></i>
            No computer components found in catalog. Create one using the <strong>Add Component</strong> button.
          </td>
        </tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php require_once '../includes/footer.php'; ?>
