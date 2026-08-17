/* ==========================================================================
   ADMIN DASHBOARD SHELL, OVERVIEW, PROFILE & ACTIVITY LOGS MODULE
   ========================================================================== */

let activeAdminTab = 'overview';

function showAdminDashboard(tabName) {
  if (tabName) activeAdminTab = tabName;
  if (window.location.pathname !== `/dashboard/${activeAdminTab}` && window.location.pathname !== '/dashboard') {
    window.history.pushState(null, '', activeAdminTab === 'overview' ? '/dashboard' : `/dashboard/${activeAdminTab}`);
  }

  const pub = document.getElementById('public-app');
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dashboard-view');

  if (pub) pub.style.display = 'none';
  if (loginView) loginView.style.display = 'none';
  if (dashView) dashView.style.display = 'flex';

  if (currentAdminUser) {
    const nameEl = document.getElementById('admin-user-name');
    if (nameEl) nameEl.innerText = currentAdminUser.name;
    const badgeEl = document.getElementById('admin-user-role-badge');
    if (badgeEl) badgeEl.innerText = (currentAdminUser.role || 'ADMIN').replace('_', ' ');
    const topAvatar = document.getElementById('admin-topbar-avatar');
    if (topAvatar) topAvatar.src = currentAdminUser.avatar_url || 'https://lhcvcgkjktgxofmkjcsv.supabase.co/storage/v1/object/public/media/branding/logo.png';

    // Hide users tab and logs tab for Content Admin
    const usersTab = document.getElementById('sidebar-item-users');
    const logsTab = document.getElementById('sidebar-item-logs');
    if (usersTab) usersTab.style.display = currentAdminUser.role === 'SUPER_ADMIN' ? 'block' : 'none';
    if (logsTab) logsTab.style.display = currentAdminUser.role === 'SUPER_ADMIN' ? 'block' : 'none';
  }

  switchAdminTab(activeAdminTab, false);
}

async function switchAdminTab(tabName, updateUrl = true) {
  activeAdminTab = tabName;
  if (updateUrl) {
    window.history.pushState(null, '', tabName === 'overview' ? '/dashboard' : `/dashboard/${tabName}`);
  }
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));

  const activeLink = document.querySelector(`.sidebar-link[onclick="switchAdminTab('${tabName}')"]`);
  if (activeLink) activeLink.classList.add('active');

  const contentArea = document.getElementById('admin-content-area');
  const titleEl = document.getElementById('admin-page-title');

  switch (tabName) {
    case 'overview':
      titleEl.innerText = 'Dashboard Overview';
      renderOverviewTab(contentArea);
      break;
    case 'settings':
      titleEl.innerText = 'Website Settings & Details';
      renderSettingsTab(contentArea);
      break;
    case 'pages':
      titleEl.innerText = 'Editable Pages Content (Home, About, Community)';
      renderPagesTab(contentArea);
      break;
    case 'events':
      titleEl.innerText = 'Events & Majalis Management';
      renderEventsTab(contentArea);
      break;
    case 'announcements':
      titleEl.innerText = 'Announcements Management';
      renderAnnouncementsTab(contentArea);
      break;
    case 'gallery':
      titleEl.innerText = 'Photo Gallery & Category Manager';
      renderGalleryTab(contentArea);
      break;
    case 'media':
      titleEl.innerText = 'Media Center Manager';
      renderMediaTab(contentArea);
      break;
    case 'social':
      titleEl.innerText = 'Social Links Management';
      renderSocialTab(contentArea);
      break;
    case 'inbox':
      titleEl.innerText = 'Contact Messages Inbox';
      renderInboxTab(contentArea);
      break;
    case 'visitor_posts':
      titleEl.innerText = 'Visitor Posts Management';
      renderVisitorPostsTab(contentArea);
      break;
    case 'users':
      titleEl.innerText = 'Admin Users & Role Access';
      renderUsersTab(contentArea);
      break;
    case 'profile':
      titleEl.innerText = 'My Admin Profile & Security Settings';
      renderProfileTab(contentArea);
      break;
    case 'activity_logs':
      titleEl.innerText = 'Admin Activity Logs';
      renderActivityLogsTab(contentArea);
      break;
  }
}

// --- TAB 1: OVERVIEW ---
async function renderOverviewTab(container) {
  container.innerHTML = `<div style="text-align:center; padding:3rem;"><i class="ri-loader-4-line ri-spin" style="font-size:2rem; color:var(--primary);"></i> Loading stats...</div>`;

  try {
    const res = await fetch('/api/admin/dashboard_stats', { headers: getAdminHeaders() });
    const stats = await res.json();

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="ri-calendar-event-line"></i></div>
          <div>
            <div class="stat-num">${stats.total_events || 0}</div>
            <div class="stat-label">Total Events</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEF3C7; color:#92400E;"><i class="ri-time-line"></i></div>
          <div>
            <div class="stat-num">${stats.upcoming_events || 0}</div>
            <div class="stat-label">Upcoming Events</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#E0E7FF; color:#3730A3;"><i class="ri-image-line"></i></div>
          <div>
            <div class="stat-num">${stats.total_gallery || 0}</div>
            <div class="stat-label">Gallery Photos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#DEF7EC; color:#03543F;"><i class="ri-notification-3-line"></i></div>
          <div>
            <div class="stat-num">${stats.total_announcements || 0}</div>
            <div class="stat-label">Announcements</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEE2E2; color:#991B1B;"><i class="ri-mail-unread-line"></i></div>
          <div>
            <div class="stat-num">${stats.unread_messages || 0}</div>
            <div class="stat-label">Unread Messages</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h4 style="color:var(--primary-dark);"><i class="ri-speed-up-line"></i> Quick Shortcuts & Guidance</h4>
        </div>
        <div class="panel-body">
          <p style="margin-bottom:1rem; color:var(--text-muted);">
            From this portal, any changes made to events, photos, announcements, hero titles, or address info are immediately saved in the database and updated on the live website automatically.
          </p>
          <div style="display:flex; gap:1rem; flex-wrap:wrap;">
            <button onclick="switchAdminTab('events')" class="btn btn-outline btn-sm"><i class="ri-calendar-event-line"></i> Manage Events</button>
            <button onclick="switchAdminTab('announcements')" class="btn btn-outline btn-sm"><i class="ri-notification-3-line"></i> Announcements</button>
            <button onclick="switchAdminTab('gallery')" class="btn btn-outline btn-sm"><i class="ri-image-add-line"></i> Upload Photos</button>
            <button onclick="switchAdminTab('pages')" class="btn btn-outline btn-sm"><i class="ri-edit-2-line"></i> Edit Pages</button>
            <button onclick="switchAdminTab('settings')" class="btn btn-outline btn-sm"><i class="ri-settings-4-line"></i> Website Settings</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:red; padding:2rem;">Failed to load overview data.</div>`;
  }
}

// --- TAB: MY PROFILE MANAGEMENT ---
function renderProfileTab(container) {
  const user = currentAdminUser || {};

  container.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-user-3-line"></i> Update Profile Picture & Name</h4>
        <button onclick="saveAdminProfile()" class="btn btn-primary btn-sm"><i class="ri-save-line"></i> Save Profile Changes</button>
      </div>
      <div class="panel-body">
        <form id="admin-profile-form" onsubmit="event.preventDefault(); saveAdminProfile();">
          <div style="display:flex; align-items:center; gap:2rem; margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid var(--border-color);">
            <div style="text-align:center;">
              <img src="${user.avatar_url || 'https://lhcvcgkjktgxofmkjcsv.supabase.co/storage/v1/object/public/media/branding/logo.png'}" id="profile-avatar-preview" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--gold); box-shadow:var(--shadow-md);" alt="Profile Picture">
            </div>
            <div>
              <h4 style="color:var(--primary-dark); margin-bottom:0.4rem;">Profile Picture / Avatar</h4>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.8rem;">Upload a custom image or photo for your admin account profile.</p>
              <div style="display:flex; gap:0.5rem;">
                <input type="file" id="profile-avatar-file" style="display:none;" onchange="handleProfileAvatarUpload(event)">
                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('profile-avatar-file').click()"><i class="ri-upload-2-line"></i> Change Photo</button>
                <input type="hidden" id="prof-avatar-url" value="${user.avatar_url || 'https://lhcvcgkjktgxofmkjcsv.supabase.co/storage/v1/object/public/media/branding/logo.png'}">
              </div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" id="prof-name" class="form-control" value="${user.name || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input type="email" id="prof-email" class="form-control" value="${user.email || ''}" required>
            </div>

            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">New Password (leave blank to keep current password)</label>
              <input type="password" id="prof-password" class="form-control" placeholder="••••••••">
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

async function handleProfileAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById('prof-avatar-url').value = data.url;
      document.getElementById('profile-avatar-preview').src = data.url;
      showToast("Avatar image uploaded!", "success");
    } else {
      showToast(data.error || "Upload failed.", "error");
    }
  } catch (err) { showToast("Upload error.", "error"); }
}

async function saveAdminProfile() {
  const name = document.getElementById('prof-name').value;
  const email = document.getElementById('prof-email').value;
  const avatar_url = document.getElementById('prof-avatar-url').value;
  const password = document.getElementById('prof-password').value;

  try {
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ name, email, avatar_url, password })
    });
    const data = await res.json();

    if (res.ok) {
      currentAdminUser = data.user;
      document.getElementById('admin-user-name').innerText = currentAdminUser.name;
      const topAvatar = document.getElementById('admin-topbar-avatar');
      if (topAvatar) topAvatar.src = currentAdminUser.avatar_url;

      showToast("Profile updated successfully!", "success");
      document.getElementById('prof-password').value = '';
    } else {
      showToast(data.error || "Failed to update profile.", "error");
    }
  } catch (err) { showToast("Error connecting to server.", "error"); }
}

// --- TAB: ACTIVITY LOGS ---
async function renderActivityLogsTab(container) {
  container.innerHTML = `<div style="text-align:center; padding:2rem;"><i class="ri-loader-4-line ri-spin" style="font-size:2rem; color:var(--primary);"></i> Loading activity logs...</div>`;
  try {
    const res = await fetch('/api/admin/activity_logs', { headers: getAdminHeaders() });
    const logs = await res.json();
    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h4 style="color:var(--primary-dark);"><i class="ri-file-list-3-line"></i> Admin Activity Log</h4>
        </div>
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${logs.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:2rem;">No activity logs found.</td></tr>' : logs.map(l => `
                <tr>
                  <td style="font-size:0.85rem; color:var(--text-muted);">${new Date(l.created_at).toLocaleString()}</td>
                  <td><strong>${l.admin_name}</strong><br><small style="color:var(--text-muted);">${l.admin_email}</small></td>
                  <td><span class="badge badge-${l.action_type === 'DELETE' ? 'danger' : (l.action_type === 'CREATE' ? 'success' : (l.action_type === 'LOGIN' ? 'primary' : 'warning'))}">${l.action_type}</span></td>
                  <td>${l.target_entity || '-'}</td>
                  <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${l.details || ''}">${l.details || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div style="color:red; padding:2rem;">Failed to load activity logs.</div>`;
  }
}
