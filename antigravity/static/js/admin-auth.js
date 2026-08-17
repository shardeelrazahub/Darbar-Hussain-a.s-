/* ==========================================================================
   ADMIN AUTHENTICATION & ACCESS CONTROL MODULE
   ========================================================================== */

let currentAdminUser = null;

function getAdminHeaders() {
  const token = localStorage.getItem('admin_token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function showAdminLogin(tab = 'login', updateUrl = true) {
  if (updateUrl) {
    const targetUrl = tab === 'signup' ? '/signup' : '/login';
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  }

  const pub = document.getElementById('public-app');
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dashboard-view');

  if (pub) pub.style.display = 'none';
  if (loginView) loginView.style.display = 'flex';
  if (dashView) dashView.style.display = 'none';

  switchAuthTab(tab);
}

function showPublicSite(updateUrl = true) {
  if (updateUrl && window.location.pathname !== '/') {
    window.history.pushState(null, '', '/');
  }
  const pub = document.getElementById('public-app');
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dashboard-view');

  if (pub) pub.style.display = 'block';
  if (loginView) loginView.style.display = 'none';
  if (dashView) dashView.style.display = 'none';
}

function switchAuthTab(tab) {
  const errBox = document.getElementById('login-error-alert');
  if (errBox) errBox.style.display = 'none';

  const loginForm = document.getElementById('admin-login-form');
  const signupForm = document.getElementById('admin-signup-form');
  const loginBtn = document.getElementById('tab-login-btn');
  const signupBtn = document.getElementById('tab-signup-btn');

  if (tab === 'signup') {
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (loginBtn) loginBtn.classList.remove('active');
    if (signupBtn) signupBtn.classList.add('active');
  } else {
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (loginBtn) loginBtn.classList.add('active');
    if (signupBtn) signupBtn.classList.remove('active');
  }
}

function showAuthAlert(message, type) {
  const errBox = document.getElementById('login-error-alert');
  if (!errBox) return;
  errBox.innerHTML = message;
  if (type === 'success') {
    errBox.style.background = '#DEF7EC';
    errBox.style.color = '#03543F';
    errBox.style.border = '1px solid #31C48D';
  } else {
    errBox.style.background = '#FEE2E2';
    errBox.style.color = '#991B1B';
    errBox.style.border = '1px solid #F87171';
  }
  errBox.style.display = 'block';
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.className = 'ri-eye-line';
  } else {
    input.type = 'password';
    if (icon) icon.className = 'ri-eye-off-line';
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errBox = document.getElementById('login-error-alert');
  const btn = document.getElementById('login-submit-btn');
  if (errBox) errBox.style.display = 'none';

  btn.disabled = true;
  btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Logging in...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('admin_token', data.token);
      currentAdminUser = data.user;
      showToast("Welcome back, " + currentAdminUser.name + "!", "success");
      showAdminDashboard('overview');
    } else if (data.requires_approval) {
      showAuthAlert("⏳ " + (data.error || "Your account application is currently pending approval by the Super Administrator."), "error");
      showToast(data.error || "Account pending Super Administrator approval.", "warning", 7000);
    } else {
      showAuthAlert(data.error || "Login failed. Please check your credentials.", "error");
      showToast(data.error || "Login failed.", "error");
    }
  } catch (err) {
    showAuthAlert("Connection error. Failed to reach server.", "error");
    showToast("Connection error. Failed to reach server.", "error");
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ri-login-box-line"></i> Secure Login';
}

async function handleAdminSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  const btn = document.getElementById('signup-submit-btn');

  if (password !== confirmPassword) {
    showAuthAlert("Passwords do not match.", "error");
    showToast("Passwords do not match.", "error");
    return;
  }

  if (password.length < 6) {
    showAuthAlert("Password must be at least 6 characters.", "error");
    showToast("Password must be at least 6 characters.", "error");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Submitting Application...';

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (res.ok) {
      const loginEmail = document.getElementById('login-email');
      if (loginEmail) loginEmail.value = email;

      showAdminLogin('login');
      showAuthAlert("✅ <strong>Application Submitted!</strong> Your account has been registered and is now pending approval by the Super Administrator (alaewada43@gmail.com). You will be able to log in once access is granted.", "success");
      showToast("Application submitted for Super Administrator approval!", "success", 8000);

      const form = document.getElementById('admin-signup-form');
      if (form) form.reset();
    } else {
      showAuthAlert(data.error || "Signup failed.", "error");
      showToast(data.error || "Signup failed.", "error");
    }
  } catch (err) {
    showAuthAlert("Connection error. Failed to reach server.", "error");
    showToast("Connection error. Failed to reach server.", "error");
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ri-user-add-line"></i> Submit Account Application';
}

async function checkAdminDashboardAuth(requestedTab = 'overview') {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    showToast("Protected Area: Please log in to access the dashboard.", "warning", 4000);
    showAdminLogin('login');
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      currentAdminUser = data.user;
      showAdminDashboard(requestedTab);
    } else {
      localStorage.removeItem('admin_token');
      showToast("Session expired or unauthorized. Please log in.", "error", 4000);
      showAdminLogin('login');
    }
  } catch (err) {
    showToast("Could not verify session. Please log in.", "error", 4000);
    showAdminLogin('login');
  }
}

async function handleAdminLogout() {
  const token = localStorage.getItem('admin_token');
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) { }
  }
  localStorage.removeItem('admin_token');
  currentAdminUser = null;
  showToast("Signed out successfully.", "success");
  showPublicSite();
}

// Window global bindings
window.showAdminLogin = showAdminLogin;
window.showPublicSite = showPublicSite;
window.switchAuthTab = switchAuthTab;
window.handleAdminLogin = handleAdminLogin;
window.handleAdminSignup = handleAdminSignup;
window.checkAdminDashboardAuth = checkAdminDashboardAuth;
window.handleAdminLogout = handleAdminLogout;
window.togglePasswordVisibility = togglePasswordVisibility;
