<?php
/**
 * Thirdwave Admin Authentication Page
 */
require_once 'includes/db.php';
require_once 'includes/header.php';

// If already authenticated, bypass login
if (isset($_SESSION['admin'])) {
    header("Location: admin/dashboard.php");
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    if (empty($username) || empty($password)) {
        $error = "Please provide both administrative credentials.";
    } else {
        // Query database for admin user matching username
        $stmt = $conn->prepare("SELECT * FROM admin WHERE username = ?");
        if ($stmt) {
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result && $result->num_rows > 0) {
                $user = $result->fetch_assoc();
                
                // For this academic project, standard plain text or bcrypt checks can be supported.
                // We compare plain text as specified by requirements: "admin123"
                if ($password === $user['password']) {
                    $_SESSION['admin'] = $user['username'];
                    $_SESSION['admin_fullname'] = $user['fullname'];
                    
                    header("Location: admin/dashboard.php");
                    exit;
                } else {
                    $error = "Incorrect, please verify administrative password.";
                }
            } else {
                $error = "Administrative profile not found with that username.";
            }
            $stmt->close();
        } else {
            $error = "Database compilation error: " . $conn->error;
        }
    }
}
?>

<div class="form-container" style="max-width: 420px; margin: 40px auto; padding: 35px;" id="login_card">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="width: 60px; height: 60px; background-color: rgba(59, 130, 246, 0.1); color: var(--accent-color); display: flex; align-items: center; justify-content: center; border-radius: 50%; margin: 0 auto 15px;">
      <i data-lucide="shield-check" style="width: 30px; height: 30px;"></i>
    </div>
    <h1 style="font-size:24px; margin-bottom: 5px;">Admin Gateway</h1>
    <p style="color: var(--text-muted); font-size:13px;">Manage orders, catalog, messages, & trade requests.</p>
  </div>

  <?php if (!empty($error)): ?>
    <div class="alert alert-danger" style="padding:10px 15px; font-size:13px;" id="login_error">
      <i data-lucide="alert-circle" style="display:inline-block; vertical-align:middle; width:16px; margin-right:4px;"></i>
      <?php echo htmlspecialchars($error); ?>
    </div>
  <?php endif; ?>

  <form action="login.php" method="POST" id="login_form">
    <div class="form-group">
      <label class="form-label">Username</label>
      <input type="text" name="username" class="form-control form-control-block" placeholder="admin" value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>" required autofocus>
    </div>
    
    <div class="form-group" style="margin-bottom: 25px;">
      <label class="form-label">Password</label>
      <input type="password" name="password" class="form-control form-control-block" placeholder="••••••••" required>
    </div>
    
    <button type="submit" class="btn btn-primary btn-block"><i data-lucide="log-in" style="width:16px; height:16px;"></i> Authenticate Admin</button>
  </form>

  <div style="text-align: center; margin-top: 25px; border-top: 1px solid var(--border-color); padding-top: 15px; font-size: 11px; color: var(--text-muted);">
    <p>Default credentials (academic):<br>Username: <code>admin</code> | Password: <code>admin123</code></p>
  </div>
</div>

<?php require_once 'includes/footer.php'; ?>
