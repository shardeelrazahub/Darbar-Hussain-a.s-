/* ==========================================================================
   ADMIN COMMUNITY, MESSAGES & USERS MANAGEMENT MODULE
   ========================================================================== */

let adminMessages = [];
let adminVisitorPosts = [];
let adminUsersList = [];

// --- TAB: INBOX ---
async function renderInboxTab(container) {
  const res = await fetch('/api/admin/messages', { headers: getAdminHeaders() });
  adminMessages = await res.json();

  container.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-inbox-line"></i> Contact Form Messages Inbox</h4>
      </div>
      <div class="panel-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Contact Info</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${adminMessages.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:2rem;">Inbox is empty. No messages received yet.</td></tr>` : ''}
            ${adminMessages.map(m => `
              <tr style="${m.is_read ? '' : 'font-weight:bold; background:#FDFBF7;'}">
                <td>${m.name}</td>
                <td>
                  ${m.email ? `<div><i class="ri-mail-line"></i> ${m.email}</div>` : ''}
                  ${m.phone ? `<div><i class="ri-phone-line"></i> ${m.phone}</div>` : ''}
                </td>
                <td style="max-width:300px;">${m.message}</td>
                <td>${m.created_at}</td>
                <td>
                  ${!m.is_read ? `<button onclick="markMessageRead(${m.id})" class="btn btn-outline btn-sm" title="Mark Read"><i class="ri-check-double-line"></i></button>` : ''}
                  <button onclick="deleteMessage(${m.id})" class="btn btn-danger btn-sm" title="Delete"><i class="ri-delete-bin-line"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function markMessageRead(id) {
  await fetch(`/api/admin/messages/${id}/read`, { method: 'PUT', headers: getAdminHeaders() });
  showToast("Marked as read.", "success");
  renderInboxTab(document.getElementById('admin-content-area'));
}

async function deleteMessage(id) {
  if (!confirm("Delete message?")) return;
  await fetch(`/api/admin/messages/${id}`, { method: 'DELETE', headers: getAdminHeaders() });
  showToast("Deleted message.", "success");
  renderInboxTab(document.getElementById('admin-content-area'));
}

// --- TAB: VISITOR POSTS ---
async function renderVisitorPostsTab(container) {
  const res = await fetch('/api/admin/visitor_posts', { headers: getAdminHeaders() });
  const data = await res.json();
  adminVisitorPosts = data.visitor_posts || [];

  container.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-message-2-line"></i> Visitor Posts</h4>
      </div>
      <div class="panel-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Content</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${adminVisitorPosts.length === 0 ? `<tr><td colspan="4" style="text-align:center; padding:2rem;">No visitor posts available.</td></tr>` : ''}
            ${adminVisitorPosts.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td style="max-width:300px;">
                  ${p.content}
                  ${p.media_url ? `<br><a href="${p.media_url}" target="_blank" style="font-size:0.85rem; color:var(--primary);"><i class="ri-attachment-line"></i> View Attached ${p.media_type === 'video' ? 'Video' : 'Image'}</a>` : ''}
                </td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  <button onclick="deleteVisitorPost(${p.id})" class="btn btn-danger btn-sm" title="Delete"><i class="ri-delete-bin-line"></i> Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function deleteVisitorPost(id) {
  if (!confirm("Are you sure you want to delete this visitor post?")) return;
  await fetch(`/api/admin/visitor_posts/${id}`, { method: 'DELETE', headers: getAdminHeaders() });
  showToast("Post deleted.", "success");
  renderVisitorPostsTab(document.getElementById('admin-content-area'));
  if (typeof fetchPublicData === 'function') fetchPublicData();
}

// --- TAB: USERS (SUPER ADMIN ONLY) ---
async function renderUsersTab(container) {
  if (!currentAdminUser || currentAdminUser.role !== 'SUPER_ADMIN') {
    container.innerHTML = `<div style="padding:2rem; color:red;">Super Admin privilege required.</div>`;
    return;
  }

  container.innerHTML = `<div style="text-align:center; padding:2rem;"><i class="ri-loader-4-line ri-spin" style="font-size:2rem; color:var(--primary);"></i> Loading admin accounts...</div>`;

  const res = await fetch('/api/admin/users', { headers: getAdminHeaders() });
  adminUsersList = await res.json();

  const pendingUsers = adminUsersList.filter(u => u.status === 'PENDING' && u.email !== 'alaewada43@gmail.com');
  const allUsers = adminUsersList;

  container.innerHTML = `
    <!-- Pending Applications Card -->
    ${pendingUsers.length > 0 ? `
      <div class="panel" style="border:2px solid var(--gold); margin-bottom:2rem;">
        <div class="panel-header" style="background:#FEF3C7; color:#92400E;">
          <h4 style="color:#92400E; margin:0;"><i class="ri-user-follow-line"></i> Pending Admin Access Applications (${pendingUsers.length})</h4>
        </div>
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email Address</th>
                <th>Registered Date</th>
                <th>Review Action</th>
              </tr>
            </thead>
            <tbody>
              ${pendingUsers.map(u => `
                <tr>
                  <td><strong>${u.name}</strong></td>
                  <td>${u.email}</td>
                  <td>${new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style="display:flex; gap:0.5rem;">
                      <button onclick="approveAdminUser(${u.id})" class="btn btn-sm" style="background:#059669; color:#fff;" title="Approve Access"><i class="ri-check-line"></i> Approve Access</button>
                      <button onclick="rejectAdminUser(${u.id})" class="btn btn-danger btn-sm" title="Reject Access"><i class="ri-close-line"></i> Reject</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}

    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-user-settings-line"></i> All Admin Accounts</h4>
        <button onclick="openUserModal()" class="btn btn-primary btn-sm"><i class="ri-user-add-line"></i> Create Admin User</button>
      </div>
      <div class="panel-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Access Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${allUsers.map(u => {
              const isSuper = u.email === 'alaewada43@gmail.com' || u.role === 'SUPER_ADMIN';
              let statusBadge = '<span class="badge badge-success">Approved</span>';
              if (u.status === 'PENDING') statusBadge = '<span class="badge badge-warning">Pending Approval</span>';
              else if (u.status === 'REJECTED') statusBadge = '<span class="badge badge-danger">Rejected</span>';

              return `
                <tr>
                  <td><strong>${u.name}</strong> ${isSuper ? '<i class="ri-shield-star-fill" style="color:var(--gold);" title="Sole Super Administrator"></i>' : ''}</td>
                  <td>${u.email}</td>
                  <td><span class="badge ${isSuper ? 'badge-warning' : 'badge-success'}">${isSuper ? 'SUPER ADMIN' : 'CONTENT ADMIN'}</span></td>
                  <td>${statusBadge}</td>
                  <td>
                    <div style="display:flex; gap:0.4rem; align-items:center;">
                      ${!isSuper && u.status === 'PENDING' ? `
                        <button onclick="approveAdminUser(${u.id})" class="btn btn-sm" style="background:#059669; color:#fff;" title="Approve"><i class="ri-check-line"></i> Approve</button>
                        <button onclick="rejectAdminUser(${u.id})" class="btn btn-danger btn-sm" title="Reject"><i class="ri-close-line"></i> Reject</button>
                      ` : ''}
                      ${!isSuper && u.status === 'REJECTED' ? `
                        <button onclick="approveAdminUser(${u.id})" class="btn btn-sm" style="background:#059669; color:#fff;" title="Re-Approve Access"><i class="ri-refresh-line"></i> Re-Approve</button>
                      ` : ''}
                      ${!isSuper ? `
                        <button onclick="deleteAdminUser(${u.id})" class="btn btn-danger btn-sm" title="Delete"><i class="ri-delete-bin-line"></i></button>
                      ` : '<span style="color:var(--text-muted); font-size:0.85rem;">Sole Superadmin</span>'}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Modal -->
    <div id="admin-user-modal" class="modal-backdrop">
      <div class="modal-content-wrap" style="padding:2rem; max-width:500px;">
        <button class="modal-close" onclick="closeUserModal()">&times;</button>
        <h3 style="margin-bottom:1.5rem; color:var(--primary-dark);">Add Admin User</h3>
        <form onsubmit="saveUserForm(event)">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="usr-name" class="form-control" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" id="usr-email" class="form-control" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password *</label>
            <input type="password" id="usr-pass" class="form-control" required>
          </div>
          <div class="form-group">
            <label class="form-label">Role</label>
            <select id="usr-role" class="form-control">
              <option value="CONTENT_ADMIN">Content Admin (Pages, Gallery, Events)</option>
            </select>
            <small style="color:var(--text-muted);">Note: Sole Super Administrator is alaewada43@gmail.com.</small>
          </div>
          <div style="margin-top:1.5rem; text-align:right;">
            <button type="submit" class="btn btn-primary"><i class="ri-save-line"></i> Create Approved Account</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function openUserModal() { document.getElementById('admin-user-modal').classList.add('active'); }
function closeUserModal() { document.getElementById('admin-user-modal').classList.remove('active'); }

async function approveAdminUser(userId) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/approve`, {
      method: 'POST',
      headers: getAdminHeaders()
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || "User approved successfully!", "success");
      renderUsersTab(document.getElementById('admin-content-area'));
    } else {
      showToast(data.error || "Approval failed.", "error");
    }
  } catch (err) {
    showToast("Connection error while approving user.", "error");
  }
}

async function rejectAdminUser(userId) {
  if (!confirm("Are you sure you want to reject this applicant's access to the dashboard?")) return;
  try {
    const res = await fetch(`/api/admin/users/${userId}/reject`, {
      method: 'POST',
      headers: getAdminHeaders()
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || "User rejected.", "warning");
      renderUsersTab(document.getElementById('admin-content-area'));
    } else {
      showToast(data.error || "Rejection failed.", "error");
    }
  } catch (err) {
    showToast("Connection error while rejecting user.", "error");
  }
}

async function saveUserForm(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('usr-name').value,
    email: document.getElementById('usr-email').value,
    password: document.getElementById('usr-pass').value,
    role: 'CONTENT_ADMIN'
  };

  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast("Admin account created and approved!", "success");
      closeUserModal();
      renderUsersTab(document.getElementById('admin-content-area'));
    } else {
      const d = await res.json();
      showToast(d.error || "Failed to create account.", "error");
    }
  } catch (err) { showToast("Save failed.", "error"); }
}

async function deleteAdminUser(id) {
  if (!confirm("Delete this admin account?")) return;
  try {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: getAdminHeaders() });
    const data = await res.json();
    if (res.ok) {
      showToast("Account deleted.", "success");
      renderUsersTab(document.getElementById('admin-content-area'));
    } else {
      showToast(data.error || "Failed to delete user.", "error");
    }
  } catch (e) {
    showToast("Delete failed.", "error");
  }
}

// Global mappings
window.approveAdminUser = approveAdminUser;
window.rejectAdminUser = rejectAdminUser;
