<?php
/**
 * Thirdwave Page Footer Block
 */
// Dynamic base prefix logic for links
$is_admin_folder = strpos($_SERVER['SCRIPT_NAME'], '/admin/') !== false;
$base_prefix = $is_admin_folder ? '../' : '';
?>
</main>

<footer class="site-footer" id="site_footer">
  <div class="footer-container">
    <div>
      <p>&copy; <?php echo date('Y'); ?> <strong>Thirdwave Inc.</strong> All rights reserved. Your premier PC components companion.</p>
    </div>
    <div class="footer-links">
      <a href="<?php echo $base_prefix; ?>about.php">About Us</a>
      <a href="<?php echo $base_prefix; ?>products.php">Store Catalog</a>
      <a href="<?php echo $base_prefix; ?>sell.php">Trade Parts</a>
      <a href="<?php echo $base_prefix; ?>contact.php">Help Desk</a>
    </div>
  </div>
</footer>

<script>
  // Initialize Lucide SVG Icons to make everything look crisp and aesthetic!
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
</script>
</body>
</html>
