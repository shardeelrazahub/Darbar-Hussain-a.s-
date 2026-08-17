/* ==========================================================================
   ADMIN GALLERY & UPLOAD HELPERS MODULE
   ========================================================================== */

let adminGallery = [];
let adminCategories = [];

// --- TAB: GALLERY & CATEGORIES ---
async function renderGalleryTab(container) {
  container.innerHTML = `<div style="text-align:center; padding:2rem;"><i class="ri-loader-4-line ri-spin" style="font-size:2rem; color:var(--primary);"></i> Loading gallery...</div>`;

  try {
    const [resG, resC] = await Promise.all([
      fetch('/api/admin/gallery', { headers: getAdminHeaders() }),
      fetch('/api/admin/categories', { headers: getAdminHeaders() })
    ]);
    adminGallery = await resG.json();
    adminCategories = await resC.json();

    container.innerHTML = `
      <div style="margin-bottom:2rem;">
        <div class="panel">
          <div class="panel-header">
            <h4 style="color:var(--primary-dark);"><i class="ri-upload-cloud-line"></i> Quick Image Upload</h4>
          </div>
          <div class="panel-body">
            <div class="upload-dropzone" onclick="document.getElementById('gallery-upload-file').click()">
              <i class="ri-image-add-line" style="font-size:2.5rem; color:var(--gold);"></i>
              <h4 style="margin-top:0.5rem; color:var(--primary-dark);">Click to select and upload a photo</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">Supports PNG, JPG, JPEG, WEBP (Max 16MB)</p>
              <input type="file" id="gallery-upload-file" style="display:none;" onchange="handleGalleryUpload(event)">
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h4 style="color:var(--primary-dark);"><i class="ri-gallery-line"></i> Manage Gallery Photos</h4>
        </div>
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Caption (EN / UR)</th>
                <th>Category</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${adminGallery.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:2rem;">No gallery images uploaded yet.</td></tr>` : ''}
              ${adminGallery.map(img => `
                <tr>
                  <td><img src="${img.image_url}" class="table-img"></td>
                  <td>
                    <strong>${img.caption_en || 'Untitled'}</strong><br>
                    <span class="urdu-font" style="color:var(--gold-hover);">${img.caption_ur || ''}</span>
                  </td>
                  <td>${img.category_name_en || 'Uncategorized'}</td>
                  <td>${img.display_order || 0}</td>
                  <td>
                    <button onclick="deleteGalleryImage(${img.id})" class="btn btn-danger btn-sm"><i class="ri-delete-bin-line"></i> Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:red;">Failed to load gallery content.</div>`;
  }
}

async function handleGalleryUpload(e) {
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
      // Add to gallery DB
      const caption = prompt("Enter caption for this image (or leave blank):", file.name) || '';
      await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          category_id: adminCategories[0] ? adminCategories[0].id : null,
          image_url: data.url,
          caption_en: caption,
          caption_ur: caption
        })
      });
      showToast("Gallery image uploaded successfully!", "success");
      renderGalleryTab(document.getElementById('admin-content-area'));
      await fetchPublicData();
    } else {
      showToast(data.error || "Upload failed.", "error");
    }
  } catch (err) { showToast("Upload error.", "error"); }
}

async function deleteGalleryImage(id) {
  if (!confirm("Delete this gallery image?")) return;
  await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE', headers: getAdminHeaders() });
  showToast("Image deleted.", "success");
  renderGalleryTab(document.getElementById('admin-content-area'));
  await fetchPublicData();
}

// --- UTILITY HELPER FOR FILE UPLOADS ---
async function handleFileUpload(fileInputId, targetInputId) {
  const fileInput = document.getElementById(fileInputId);
  const file = fileInput.files[0];
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
      document.getElementById(targetInputId).value = data.url;
      showToast("Image uploaded and path updated!", "success");
    } else {
      showToast(data.error || "Upload failed.", "error");
    }
  } catch (err) { showToast("Upload failed.", "error"); }
}
