<?php
/**
 * Thirdwave About Page
 */
require_once 'includes/db.php';
require_once 'includes/header.php';
?>

<div class="page-header-desc" style="margin-bottom: 40px; text-align: center;">
  <h1 class="page-title">About <span>Thirdwave</span></h1>
  <p class="page-subtitle">Pioneering a sustainable, premium marketplace for computer enthusiasts and builders.</p>
</div>

<div class="about-grid">
  <div class="about-text">
    <h2 style="font-size: 24px;">Our Mission</h2>
    <p>Thirdwave was founded by custom PC hobbyists who grew tired of overpriced scalpers and unsafe marketplace transactions. We built this platform to provide a direct, reliable gateway where enthusiasts can easily refresh, buy, and trade components with absolute peace of mind.</p>
    <p>We believe in custom computing accessibility. Every single item listed in our store undergoes meticulous testing. We check core frequencies, stress test temperatures under prime loads, verify silicon health, and benchmark visual outputs so that what you buy is guaranteed to perform as intended.</p>
    
    <h3 style="font-size: 18px; margin-top: 25px;">Why Trade with Thirdwave?</h3>
    <ul class="about-features">
      <li>
        <i data-lucide="check-circle-2" style="color: #10b981;"></i>
        <span><strong>Guaranteed Integration:</strong> All processors, boards, and modules are pre-checked.</span>
      </li>
      <li>
        <i data-lucide="check-circle-2" style="color: #10b981;"></i>
        <span><strong>Zero-Risk Appraisals:</strong> We buy your old gear instantly at highly competitive rates.</span>
      </li>
      <li>
        <i data-lucide="check-circle-2" style="color: #10b981;"></i>
        <span><strong>Reliable Shipping:</strong> Fast protective packaging so you can complete your build sooner.</span>
      </li>
    </ul>
  </div>

  <div class="about-categories-bento">
    <h3 style="font-size: 18px; margin-bottom: 10px; text-align: center; color: var(--accent-color);">Component Registry</h3>
    <p style="font-size: 13px; text-align: center; color: var(--text-muted);">We dynamically support, buy, swap, and list all major component classes:</p>
    
    <div class="bento-items">
      <div class="bento-item"><i data-lucide="cpu" style="display:block; margin: 0 auto 5px; color:#3b82f6;"></i> CPUs / Processors</div>
      <div class="bento-item"><i data-lucide="zap" style="display:block; margin: 0 auto 5px; color:#3b82f6;"></i> GPUs / Graphics Cards</div>
      <div class="bento-item"><i data-lucide="layers" style="display:block; margin: 0 auto 5px; color:#3b82f6;"></i> RAM / memory</div>
      <div class="bento-item"><i data-lucide="hard-drive" style="display:block; margin: 0 auto 5px; color:#3b82f6;"></i> SSDs / Storage</div>
      <div class="bento-item"><i data-lucide="server" style="display:block; margin: 0 auto 5px; color:#3b82f6;"></i> Motherboards</div>
      <div class="bento-item"><i data-lucide="plug" style="display:block; margin: 0 auto 5px; color:#3b82f6;"></i> PSUs / Power</div>
      <div class="bento-item"><i data-lucide="monitor" style="display:block; margin: 0 auto 5px; color:#3b82f6;"></i> Quad Displays</div>
      <div class="bento-item"><i data-lucide="keyboard" style="display:block; margin: 0 auto 5px; color:#3b82f6;"></i> Input Keyboards</div>
    </div>
  </div>
</div>

<div class="call-to-action" style="background-color: var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding: 40px; text-align: center; margin-top: 40px;">
  <h2 style="font-size: 24px; margin-bottom: 15px;">Ready to Level Up Your Setup?</h2>
  <p style="color: var(--text-muted); margin-bottom: 25px; max-width: 600px; margin-left: auto; margin-right: auto;">Our agents are ready to buy your current components or package your upcoming rig. Explore our verified listings or submit a sell request today.</p>
  <div style="display: flex; gap: 15px; justify-content: center;">
    <a href="products.php" class="btn btn-primary">Browse Catalog</a>
    <a href="contact.php" class="btn btn-secondary">Get Support Desk assistance</a>
  </div>
</div>

<?php require_once 'includes/footer.php'; ?>
