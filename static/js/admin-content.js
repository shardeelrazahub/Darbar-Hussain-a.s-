/* ==========================================================================
   ADMIN CONTENT MANAGEMENT MODULE (Settings, Pages, Events, Announcements, Media, Social)
   ========================================================================== */

let adminEvents = [];
let adminAnnouncements = [];
let adminMedia = [];
let adminSocial = [];

// --- TAB: SETTINGS ---
async function renderSettingsTab(container) {
  const s = siteData ? (siteData.settings || {}) : {};

  container.innerHTML = `
    <!-- 1. THEME & COLOR SCHEME CUSTOMIZER -->
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-palette-line"></i> Dynamic Theme & Color Palette</h4>
      </div>
      <div class="panel-body">
        <p style="color:var(--text-muted); margin-bottom:1.2rem;">Customize the primary colors of your website. Changes apply immediately across the entire website!</p>
        
        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="applyPresetTheme('#0B4D36', '#D4AF37', '#58181A')">🌿 Emerald & Gold (Default)</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="applyPresetTheme('#0F2C59', '#D4AF37', '#1E3A8A')">🔷 Royal Blue & Gold</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="applyPresetTheme('#1F2937', '#D4AF37', '#B91C1C')">🌑 Midnight & Crimson</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="applyPresetTheme('#064E3B', '#F59E0B', '#7C2D12')">🌲 Deep Teal & Amber</button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.5rem;">
          <div class="form-group">
            <label class="form-label">Primary Color</label>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <input type="color" id="set-theme-primary-color" value="${s.theme_primary || '#0B4D36'}" onchange="document.getElementById('set-theme-primary').value=this.value" style="width:45px; height:42px; padding:0; border:none; cursor:pointer; border-radius:var(--radius-sm);">
              <input type="text" id="set-theme-primary" class="form-control" value="${s.theme_primary || '#0B4D36'}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Gold Accent Color</label>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <input type="color" id="set-theme-gold-color" value="${s.theme_gold || '#D4AF37'}" onchange="document.getElementById('set-theme-gold').value=this.value" style="width:45px; height:42px; padding:0; border:none; cursor:pointer; border-radius:var(--radius-sm);">
              <input type="text" id="set-theme-gold" class="form-control" value="${s.theme_gold || '#D4AF37'}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Maroon / Highlight Color</label>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <input type="color" id="set-theme-maroon-color" value="${s.theme_maroon || '#58181A'}" onchange="document.getElementById('set-theme-maroon').value=this.value" style="width:45px; height:42px; padding:0; border:none; cursor:pointer; border-radius:var(--radius-sm);">
              <input type="text" id="set-theme-maroon" class="form-control" value="${s.theme_maroon || '#58181A'}">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. WEBSITE LOGO & PROFILE PICTURE -->
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-image-edit-line"></i> Website Profile Picture / Logo</h4>
      </div>
      <div class="panel-body">
        <div style="display:flex; align-items:center; gap:2rem;">
          <img src="${s.logo_url || 'https://lhcvcgkjktgxofmkjcsv.supabase.co/storage/v1/object/public/media/branding/profile_pic.jpg'}" id="set-logo-preview" style="width:90px; height:90px; border-radius:50%; object-fit:cover; border:3px solid var(--gold);" alt="Site Profile Picture">
          <div style="flex:1;">
            <label class="form-label">Website Logo / Profile Picture URL</label>
            <div style="display:flex; gap:0.5rem;">
              <input type="text" id="set-logo-url" class="form-control" value="${s.logo_url || 'https://lhcvcgkjktgxofmkjcsv.supabase.co/storage/v1/object/public/media/branding/profile_pic.jpg'}">
              <input type="file" id="set-logo-file" style="display:none;" onchange="handleLogoUpload(event)">
              <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('set-logo-file').click()"><i class="ri-upload-2-line"></i> Upload Picture</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. EDITABLE SECTION HEADINGS & BRAND NAMES -->
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-t-box-line"></i> Editable Heading Names & Brand Titles</h4>
        <button onclick="saveWebsiteSettings()" class="btn btn-primary btn-sm"><i class="ri-save-line"></i> Save All Settings</button>
      </div>
      <div class="panel-body">
        <form id="settings-form">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="form-group">
              <label class="form-label">English Website Name</label>
              <input type="text" id="set-site-name-en" class="form-control" value="${s.site_name_en || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Urdu Website Name (عنوان)</label>
              <input type="text" id="set-site-name-ur" class="form-control urdu-font" value="${s.site_name_ur || ''}">
            </div>

            <div class="form-group">
              <label class="form-label">English Subtitle</label>
              <input type="text" id="set-site-sub-en" class="form-control" value="${s.site_subtitle_en || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Urdu Subtitle</label>
              <input type="text" id="set-site-sub-ur" class="form-control urdu-font" value="${s.site_subtitle_ur || ''}">
            </div>

            <!-- Section Headings -->
            <div class="form-group">
              <label class="form-label">Events Section Heading (EN)</label>
              <input type="text" id="set-heading-events-en" class="form-control" value="${s.heading_events_en || 'Upcoming & Past Events'}">
            </div>
            <div class="form-group">
              <label class="form-label">Events Section Heading (UR)</label>
              <input type="text" id="set-heading-events-ur" class="form-control urdu-font" value="${s.heading_events_ur || 'مجالس و مذہبی پروگرامات'}">
            </div>

            <div class="form-group">
              <label class="form-label">Photo Gallery Heading (EN)</label>
              <input type="text" id="set-heading-gallery-en" class="form-control" value="${s.heading_gallery_en || 'Photo Gallery'}">
            </div>
            <div class="form-group">
              <label class="form-label">Photo Gallery Heading (UR)</label>
              <input type="text" id="set-heading-gallery-ur" class="form-control urdu-font" value="${s.heading_gallery_ur || 'فوٹو گیلری'}">
            </div>

            <div class="form-group">
              <label class="form-label">Announcements Heading (EN)</label>
              <input type="text" id="set-heading-announcements-en" class="form-control" value="${s.heading_announcements_en || 'Announcements'}">
            </div>
            <div class="form-group">
              <label class="form-label">Announcements Heading (UR)</label>
              <input type="text" id="set-heading-announcements-ur" class="form-control urdu-font" value="${s.heading_announcements_ur || 'اہم اعلانات'}">
            </div>

            <div class="form-group">
              <label class="form-label">Location Heading (EN)</label>
              <input type="text" id="set-heading-location-en" class="form-control" value="${s.heading_location_en || 'Imam Bargah Location'}">
            </div>
            <div class="form-group">
              <label class="form-label">Location Heading (UR)</label>
              <input type="text" id="set-heading-location-ur" class="form-control urdu-font" value="${s.heading_location_ur || 'امام بارگاہ کا مقام'}">
            </div>

            <div class="form-group">
              <label class="form-label">Contact Heading (EN)</label>
              <input type="text" id="set-heading-contact-en" class="form-control" value="${s.heading_contact_en || 'Contact & Official Profiles'}">
            </div>
            <div class="form-group">
              <label class="form-label">Contact Heading (UR)</label>
              <input type="text" id="set-heading-contact-ur" class="form-control urdu-font" value="${s.heading_contact_ur || 'رابطہ و سرکاری پروفائلز'}">
            </div>

            <div class="form-group">
              <label class="form-label">English Address</label>
              <input type="text" id="set-address-en" class="form-control" value="${s.address_en || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Urdu Address</label>
              <input type="text" id="set-address-ur" class="form-control urdu-font" value="${s.address_ur || ''}">
            </div>

            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="text" id="set-phone" class="form-control" value="${s.phone || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="set-email" class="form-control" value="${s.email || ''}">
            </div>

            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Google Maps Embed URL (iframe src)</label>
              <input type="text" id="set-map-embed" class="form-control" value="${s.map_embed_url || ''}">
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">SEO Page Title</label>
              <input type="text" id="set-seo-title" class="form-control" value="${s.seo_title || ''}">
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">SEO Meta Description</label>
              <textarea id="set-seo-desc" class="form-control">${s.seo_description || ''}</textarea>
            </div>
          </div>

          <div style="margin-top:1.5rem; text-align:right;">
            <button type="button" onclick="saveWebsiteSettings()" class="btn btn-primary"><i class="ri-save-line"></i> Save Website Settings</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function applyPresetTheme(primary, gold, maroon) {
  document.getElementById('set-theme-primary').value = primary;
  document.getElementById('set-theme-primary-color').value = primary;
  document.getElementById('set-theme-gold').value = gold;
  document.getElementById('set-theme-gold-color').value = gold;
  document.getElementById('set-theme-maroon').value = maroon;
  document.getElementById('set-theme-maroon-color').value = maroon;

  document.documentElement.style.setProperty('--primary', primary);
  document.documentElement.style.setProperty('--gold', gold);
  document.documentElement.style.setProperty('--maroon', maroon);

  showToast("Theme colors applied! Click 'Save Website Settings' to save permanently.", "success");
}

async function handleLogoUpload(e) {
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
      document.getElementById('set-logo-url').value = data.url;
      document.getElementById('set-logo-preview').src = data.url;
      showToast("Logo picture uploaded successfully!", "success");
    } else {
      showToast(data.error || "Upload failed.", "error");
    }
  } catch (err) { showToast("Upload error.", "error"); }
}

async function saveWebsiteSettings() {
  const data = {
    site_name_en: document.getElementById('set-site-name-en').value,
    site_name_ur: document.getElementById('set-site-name-ur').value,
    site_subtitle_en: document.getElementById('set-site-sub-en').value,
    site_subtitle_ur: document.getElementById('set-site-sub-ur').value,
    theme_primary: document.getElementById('set-theme-primary').value,
    theme_gold: document.getElementById('set-theme-gold').value,
    theme_maroon: document.getElementById('set-theme-maroon').value,
    logo_url: document.getElementById('set-logo-url').value,
    heading_events_en: document.getElementById('set-heading-events-en').value,
    heading_events_ur: document.getElementById('set-heading-events-ur').value,
    heading_gallery_en: document.getElementById('set-heading-gallery-en').value,
    heading_gallery_ur: document.getElementById('set-heading-gallery-ur').value,
    heading_announcements_en: document.getElementById('set-heading-announcements-en').value,
    heading_announcements_ur: document.getElementById('set-heading-announcements-ur').value,
    heading_location_en: document.getElementById('set-heading-location-en').value,
    heading_location_ur: document.getElementById('set-heading-location-ur').value,
    heading_contact_en: document.getElementById('set-heading-contact-en').value,
    heading_contact_ur: document.getElementById('set-heading-contact-ur').value,
    address_en: document.getElementById('set-address-en').value,
    address_ur: document.getElementById('set-address-ur').value,
    phone: document.getElementById('set-phone').value,
    email: document.getElementById('set-email').value,
    map_embed_url: document.getElementById('set-map-embed').value,
    seo_title: document.getElementById('set-seo-title').value,
    seo_description: document.getElementById('set-seo-desc').value
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast("Theme, Profile Pic, and Heading Settings saved!", "success");
      await fetchPublicData();
    } else {
      showToast("Failed to save settings.", "error");
    }
  } catch (err) {
    showToast("Error connecting to server.", "error");
  }
}

// --- TAB: PAGES ---
function renderPagesTab(container) {
  const p = siteData ? (siteData.pages || {}) : {};
  const home = p.home || {};
  const about = p.about || {};
  const comm = p.community || {};

  container.innerHTML = `
    <!-- Home Hero Page -->
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-home-4-line"></i> Editable Home Hero Section</h4>
        <button onclick="savePageContent('home')" class="btn btn-primary btn-sm"><i class="ri-save-line"></i> Save Hero Section</button>
      </div>
      <div class="panel-body">
        <form id="page-home-form">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="form-group">
              <label class="form-label">English Hero Title</label>
              <input type="text" id="home-title-en" class="form-control" value="${home.title_en || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Urdu Hero Title (عنوان)</label>
              <input type="text" id="home-title-ur" class="form-control urdu-font" value="${home.title_ur || ''}">
            </div>

            <div class="form-group">
              <label class="form-label">English Subtitle / Intro</label>
              <textarea id="home-sub-en" class="form-control">${home.subtitle_en || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Urdu Subtitle / Intro</label>
              <textarea id="home-sub-ur" class="form-control urdu-font">${home.subtitle_ur || ''}</textarea>
            </div>

            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Hero Background Image URL</label>
              <div style="display:flex; gap:0.5rem;">
                <input type="text" id="home-img-url" class="form-control" value="${home.image_url || ''}">
                <input type="file" id="home-img-file" style="display:none;" onchange="handleFileUpload('home-img-file', 'home-img-url')">
                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('home-img-file').click()"><i class="ri-upload-2-line"></i> Upload Image</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- About Page -->
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-information-line"></i> Editable About Page Content</h4>
        <button onclick="savePageContent('about')" class="btn btn-primary btn-sm"><i class="ri-save-line"></i> Save About Page</button>
      </div>
      <div class="panel-body">
        <form id="page-about-form">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="form-group">
              <label class="form-label">English Heading</label>
              <input type="text" id="about-title-en" class="form-control" value="${about.title_en || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Urdu Heading</label>
              <input type="text" id="about-title-ur" class="form-control urdu-font" value="${about.title_ur || ''}">
            </div>

            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">English Content Paragraphs</label>
              <textarea id="about-content-en" class="form-control" style="min-height:120px;">${about.content_en || ''}</textarea>
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Urdu Content Paragraphs</label>
              <textarea id="about-content-ur" class="form-control urdu-font" style="min-height:120px;">${about.content_ur || ''}</textarea>
            </div>

            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">About Section Photo URL</label>
              <div style="display:flex; gap:0.5rem;">
                <input type="text" id="about-img-url" class="form-control" value="${about.image_url || ''}">
                <input type="file" id="about-img-file" style="display:none;" onchange="handleFileUpload('about-img-file', 'about-img-url')">
                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('about-img-file').click()"><i class="ri-upload-2-line"></i> Upload Image</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Community Page -->
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-group-line"></i> Editable Community Role & Services</h4>
        <button onclick="savePageContent('community')" class="btn btn-primary btn-sm"><i class="ri-save-line"></i> Save Community</button>
      </div>
      <div class="panel-body">
        <form id="page-community-form">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="form-group">
              <label class="form-label">English Title</label>
              <input type="text" id="community-title-en" class="form-control" value="${comm.title_en || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Urdu Title</label>
              <input type="text" id="community-title-ur" class="form-control urdu-font" value="${comm.title_ur || ''}">
            </div>

            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">English Description</label>
              <textarea id="community-content-en" class="form-control">${comm.content_en || ''}</textarea>
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Urdu Description</label>
              <textarea id="community-content-ur" class="form-control urdu-font">${comm.content_ur || ''}</textarea>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

async function savePageContent(pageKey) {
  let data = {};
  if (pageKey === 'home') {
    data = {
      title_en: document.getElementById('home-title-en').value,
      title_ur: document.getElementById('home-title-ur').value,
      subtitle_en: document.getElementById('home-sub-en').value,
      subtitle_ur: document.getElementById('home-sub-ur').value,
      image_url: document.getElementById('home-img-url').value
    };
  } else if (pageKey === 'about') {
    data = {
      title_en: document.getElementById('about-title-en').value,
      title_ur: document.getElementById('about-title-ur').value,
      content_en: document.getElementById('about-content-en').value,
      content_ur: document.getElementById('about-content-ur').value,
      image_url: document.getElementById('about-img-url').value
    };
  } else if (pageKey === 'community') {
    data = {
      title_en: document.getElementById('community-title-en').value,
      title_ur: document.getElementById('community-title-ur').value,
      content_en: document.getElementById('community-content-en').value,
      content_ur: document.getElementById('community-content-ur').value
    };
  }

  try {
    const res = await fetch(`/api/admin/pages/${pageKey}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast(`Page '${pageKey}' saved successfully!`, "success");
      await fetchPublicData();
    } else {
      showToast("Failed to save page content.", "error");
    }
  } catch (err) {
    showToast("Error connecting to server.", "error");
  }
}

// --- TAB: EVENTS ---
async function renderEventsTab(container) {
  container.innerHTML = `<div style="text-align:center; padding:2rem;"><i class="ri-loader-4-line ri-spin" style="font-size:2rem; color:var(--primary);"></i> Loading events...</div>`;

  try {
    const res = await fetch('/api/admin/events', { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Server error loading events");
    adminEvents = await res.json();

    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h4 style="color:var(--primary-dark);"><i class="ri-calendar-event-line"></i> Events & Majalis Schedule</h4>
          <button onclick="openEventModal()" class="btn btn-primary btn-sm"><i class="ri-add-line"></i> Create New Event</button>
        </div>
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title (EN / UR)</th>
                <th>Date & Time</th>
                <th>Speaker</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${adminEvents.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:2rem;">No events found. Click 'Create New Event' to add one.</td></tr>` : ''}
              ${adminEvents.map(e => `
                <tr>
                  <td><img src="${e.image_url || 'https://lhcvcgkjktgxofmkjcsv.supabase.co/storage/v1/object/public/media/branding/hero_architecture.jpg'}" class="table-img"></td>
                  <td>
                    <strong>${e.title_en}</strong><br>
                    <span class="urdu-font" style="font-size:0.9rem; color:var(--gold-hover);">${e.title_ur}</span>
                  </td>
                  <td>${e.event_date} ${e.start_time ? '(' + e.start_time + ')' : ''}</td>
                  <td>${e.speaker_en || '-'}</td>
                  <td><span class="badge ${e.is_published ? 'badge-success' : 'badge-warning'}">${e.is_published ? 'Published' : 'Draft'}</span></td>
                  <td>
                    <button onclick="editEventModal(${e.id})" class="btn btn-outline btn-sm" title="Edit"><i class="ri-edit-line"></i></button>
                    <button onclick="deleteEvent(${e.id})" class="btn btn-danger btn-sm" title="Delete"><i class="ri-delete-bin-line"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Event Modal Container -->
      <div id="admin-event-modal" class="modal-backdrop">
        <div class="modal-content-wrap" style="padding:2rem; max-width:700px;">
          <button class="modal-close" onclick="closeEventModal()">&times;</button>
          <h3 id="event-modal-title" style="margin-bottom:1.5rem; color:var(--primary-dark);">Add New Event</h3>
          
          <form id="event-form" onsubmit="saveEventForm(event)">
            <input type="hidden" id="evt-id">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group">
                <label class="form-label">English Title *</label>
                <input type="text" id="evt-title-en" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">Urdu Title *</label>
                <input type="text" id="evt-title-ur" class="form-control urdu-font" required>
              </div>

              <div class="form-group">
                <label class="form-label">Event Date *</label>
                <input type="date" id="evt-date" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">Start Time</label>
                <input type="time" id="evt-start" class="form-control">
              </div>

              <div class="form-group">
                <label class="form-label">Speaker / Zakir (EN)</label>
                <input type="text" id="evt-speaker-en" class="form-control">
              </div>
              <div class="form-group">
                <label class="form-label">Speaker / Zakir (UR)</label>
                <input type="text" id="evt-speaker-ur" class="form-control urdu-font">
              </div>

              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">English Description</label>
                <textarea id="evt-desc-en" class="form-control"></textarea>
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Urdu Description</label>
                <textarea id="evt-desc-ur" class="form-control urdu-font"></textarea>
              </div>

              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Cover Image URL</label>
                <div style="display:flex; gap:0.5rem;">
                  <input type="text" id="evt-img-url" class="form-control">
                  <input type="file" id="evt-img-file" style="display:none;" onchange="handleFileUpload('evt-img-file', 'evt-img-url')">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('evt-img-file').click()">Upload</button>
                </div>
              </div>

              <div class="form-group" style="grid-column:1/-1;">
                <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                  <input type="checkbox" id="evt-published" checked>
                  <strong>Publish immediately on public website</strong>
                </label>
              </div>
            </div>

            <div style="margin-top:1.5rem; text-align:right;">
              <button type="submit" class="btn btn-primary"><i class="ri-save-line"></i> Save Event</button>
            </div>
          </form>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:red;">Failed to load events.</div>`;
  }
}

function openEventModal() {
  document.getElementById('event-modal-title').innerText = 'Add New Event';
  document.getElementById('evt-id').value = '';
  document.getElementById('event-form').reset();
  document.getElementById('admin-event-modal').classList.add('active');
}

function closeEventModal() {
  document.getElementById('admin-event-modal').classList.remove('active');
}

function editEventModal(eventId) {
  const e = adminEvents.find(item => item.id === eventId);
  if (!e) return;

  document.getElementById('event-modal-title').innerText = 'Edit Event';
  document.getElementById('evt-id').value = e.id;
  document.getElementById('evt-title-en').value = e.title_en;
  document.getElementById('evt-title-ur').value = e.title_ur;
  document.getElementById('evt-date').value = e.event_date;
  document.getElementById('evt-start').value = e.start_time || '';
  document.getElementById('evt-speaker-en').value = e.speaker_en || '';
  document.getElementById('evt-speaker-ur').value = e.speaker_ur || '';
  document.getElementById('evt-desc-en').value = e.description_en || '';
  document.getElementById('evt-desc-ur').value = e.description_ur || '';
  document.getElementById('evt-img-url').value = e.image_url || '';
  document.getElementById('evt-published').checked = !!e.is_published;

  document.getElementById('admin-event-modal').classList.add('active');
}

async function saveEventForm(e) {
  e.preventDefault();
  const id = document.getElementById('evt-id').value;
  const data = {
    title_en: document.getElementById('evt-title-en').value,
    title_ur: document.getElementById('evt-title-ur').value,
    event_date: document.getElementById('evt-date').value,
    start_time: document.getElementById('evt-start').value,
    speaker_en: document.getElementById('evt-speaker-en').value,
    speaker_ur: document.getElementById('evt-speaker-ur').value,
    description_en: document.getElementById('evt-desc-en').value,
    description_ur: document.getElementById('evt-desc-ur').value,
    image_url: document.getElementById('evt-img-url').value,
    is_published: document.getElementById('evt-published').checked
  };

  const url = id ? `/api/admin/events/${id}` : '/api/admin/events';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast("Event saved successfully!", "success");
      closeEventModal();
      renderEventsTab(document.getElementById('admin-content-area'));
      await fetchPublicData();
    } else {
      showToast("Failed to save event.", "error");
    }
  } catch (err) {
    showToast("Error connecting to server.", "error");
  }
}

async function deleteEvent(id) {
  if (!confirm("Are you sure you want to delete this event?")) return;
  try {
    const res = await fetch(`/api/admin/events/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    if (res.ok) {
      showToast("Event deleted.", "success");
      renderEventsTab(document.getElementById('admin-content-area'));
      await fetchPublicData();
    }
  } catch (e) { showToast("Delete failed.", "error"); }
}

// --- TAB: ANNOUNCEMENTS ---
async function renderAnnouncementsTab(container) {
  container.innerHTML = `<div style="text-align:center; padding:2rem;"><i class="ri-loader-4-line ri-spin" style="font-size:2rem; color:var(--primary);"></i> Loading announcements...</div>`;

  try {
    const res = await fetch('/api/admin/announcements', { headers: getAdminHeaders() });
    adminAnnouncements = await res.json();

    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h4 style="color:var(--primary-dark);"><i class="ri-notification-3-line"></i> Announcements & Ticker Banner</h4>
          <button onclick="openAnnouncementModal()" class="btn btn-primary btn-sm"><i class="ri-add-line"></i> Create Announcement</button>
        </div>
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Title (EN / UR)</th>
                <th>Content Snippet</th>
                <th>Banner Alert</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${adminAnnouncements.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:2rem;">No announcements.</td></tr>` : ''}
              ${adminAnnouncements.map(a => `
                <tr>
                  <td>
                    <strong>${a.title_en}</strong><br>
                    <span class="urdu-font" style="color:var(--gold-hover);">${a.title_ur}</span>
                  </td>
                  <td style="max-width:300px;">${a.content_en || a.content_ur || ''}</td>
                  <td>${a.is_banner ? '<span class="badge badge-success">Top Ticker</span>' : 'Standard'}</td>
                  <td><span class="badge ${a.is_published ? 'badge-success' : 'badge-warning'}">${a.is_published ? 'Published' : 'Draft'}</span></td>
                  <td>
                    <button onclick="deleteAnnouncement(${a.id})" class="btn btn-danger btn-sm"><i class="ri-delete-bin-line"></i> Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal -->
      <div id="admin-announcement-modal" class="modal-backdrop">
        <div class="modal-content-wrap" style="padding:2rem; max-width:600px;">
          <button class="modal-close" onclick="closeAnnouncementModal()">&times;</button>
          <h3 style="margin-bottom:1.5rem; color:var(--primary-dark);">Add Announcement</h3>
          <form onsubmit="saveAnnouncementForm(event)">
            <div class="form-group">
              <label class="form-label">Title (EN) *</label>
              <input type="text" id="anc-title-en" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Title (UR) *</label>
              <input type="text" id="anc-title-ur" class="form-control urdu-font" required>
            </div>
            <div class="form-group">
              <label class="form-label">Content (EN)</label>
              <textarea id="anc-content-en" class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Content (UR)</label>
              <textarea id="anc-content-ur" class="form-control urdu-font"></textarea>
            </div>
            <div class="form-group">
              <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                <input type="checkbox" id="anc-banner">
                <strong>Show in top announcement marquee banner</strong>
              </label>
            </div>
            <div style="margin-top:1.5rem; text-align:right;">
              <button type="submit" class="btn btn-primary"><i class="ri-save-line"></i> Save Announcement</button>
            </div>
          </form>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:red;">Failed to load announcements.</div>`;
  }
}

function openAnnouncementModal() { document.getElementById('admin-announcement-modal').classList.add('active'); }
function closeAnnouncementModal() { document.getElementById('admin-announcement-modal').classList.remove('active'); }

async function saveAnnouncementForm(e) {
  e.preventDefault();
  const data = {
    title_en: document.getElementById('anc-title-en').value,
    title_ur: document.getElementById('anc-title-ur').value,
    content_en: document.getElementById('anc-content-en').value,
    content_ur: document.getElementById('anc-content-ur').value,
    is_banner: document.getElementById('anc-banner').checked,
    is_published: true
  };

  try {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast("Announcement created!", "success");
      closeAnnouncementModal();
      renderAnnouncementsTab(document.getElementById('admin-content-area'));
      await fetchPublicData();
    } else {
      showToast("Save failed.", "error");
    }
  } catch (err) { showToast("Save failed.", "error"); }
}

async function deleteAnnouncement(id) {
  if (!confirm("Delete announcement?")) return;
  await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE', headers: getAdminHeaders() });
  showToast("Deleted announcement.", "success");
  renderAnnouncementsTab(document.getElementById('admin-content-area'));
  await fetchPublicData();
}

// --- TAB: MEDIA ---
async function renderMediaTab(container) {
  const res = await fetch('/api/admin/media', { headers: getAdminHeaders() });
  adminMedia = await res.json();

  container.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-video-line"></i> Media Links (YouTube, Facebook, Instagram)</h4>
        <button onclick="openMediaModal()" class="btn btn-primary btn-sm"><i class="ri-add-line"></i> Add Media Link</button>
      </div>
      <div class="panel-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Platform</th>
              <th>Media URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${adminMedia.map(m => `
              <tr>
                <td><strong>${m.title_en}</strong></td>
                <td><span class="badge badge-success">${m.media_type}</span></td>
                <td><a href="${m.media_url}" target="_blank" style="color:var(--primary);">${m.media_url}</a></td>
                <td>
                  <button onclick="deleteMediaItem(${m.id})" class="btn btn-danger btn-sm"><i class="ri-delete-bin-line"></i> Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Media Modal -->
    <div id="admin-media-modal" class="modal-backdrop">
      <div class="modal-content-wrap" style="padding:2rem; max-width:600px;">
        <button class="modal-close" onclick="closeMediaModal()">&times;</button>
        <h3 style="margin-bottom:1.5rem; color:var(--primary-dark);">Add Media Link</h3>
        <form onsubmit="saveMediaForm(event)">
          <div class="form-group">
            <label class="form-label">Title (EN) *</label>
            <input type="text" id="med-title-en" class="form-control" required>
          </div>
          <div class="form-group">
            <label class="form-label">Title (UR) *</label>
            <input type="text" id="med-title-ur" class="form-control urdu-font" required>
          </div>
          <div class="form-group">
            <label class="form-label">Platform Type</label>
            <select id="med-type" class="form-control">
              <option value="YOUTUBE">YouTube Video</option>
              <option value="FACEBOOK">Facebook Link/Video</option>
              <option value="INSTAGRAM">Instagram Post</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Media / Video URL *</label>
            <input type="url" id="med-url" class="form-control" placeholder="https://..." required>
          </div>
          <div style="margin-top:1.5rem; text-align:right;">
            <button type="submit" class="btn btn-primary"><i class="ri-save-line"></i> Save Media</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function openMediaModal() { document.getElementById('admin-media-modal').classList.add('active'); }
function closeMediaModal() { document.getElementById('admin-media-modal').classList.remove('active'); }

async function saveMediaForm(e) {
  e.preventDefault();
  const data = {
    title_en: document.getElementById('med-title-en').value,
    title_ur: document.getElementById('med-title-ur').value,
    media_type: document.getElementById('med-type').value,
    media_url: document.getElementById('med-url').value,
    is_published: true
  };

  await fetch('/api/admin/media', {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  showToast("Media added!", "success");
  closeMediaModal();
  renderMediaTab(document.getElementById('admin-content-area'));
  await fetchPublicData();
}

async function deleteMediaItem(id) {
  if (!confirm("Delete media link?")) return;
  await fetch(`/api/admin/media/${id}`, { method: 'DELETE', headers: getAdminHeaders() });
  showToast("Media link deleted.", "success");
  renderMediaTab(document.getElementById('admin-content-area'));
  await fetchPublicData();
}

// --- TAB: SOCIAL LINKS ---
async function renderSocialTab(container) {
  const res = await fetch('/api/admin/social', { headers: getAdminHeaders() });
  adminSocial = await res.json();

  container.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <h4 style="color:var(--primary-dark);"><i class="ri-share-line"></i> Official Social Media Profiles</h4>
      </div>
      <div class="panel-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Profile URL</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${adminSocial.map(s => `
              <tr>
                <td><strong>${s.platform_name_en}</strong></td>
                <td><input type="text" id="social-url-${s.id}" class="form-control" value="${s.url}"></td>
                <td><span class="badge ${s.is_active ? 'badge-success' : 'badge-warning'}">${s.is_active ? 'Active' : 'Hidden'}</span></td>
                <td>
                  <button onclick="updateSocialLink(${s.id})" class="btn btn-primary btn-sm"><i class="ri-save-line"></i> Save Link</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function updateSocialLink(id) {
  const s = adminSocial.find(item => item.id === id);
  if (!s) return;
  const newUrl = document.getElementById(`social-url-${id}`).value;

  await fetch(`/api/admin/social/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({
      platform: s.platform,
      platform_name_en: s.platform_name_en,
      platform_name_ur: s.platform_name_ur,
      url: newUrl,
      is_active: s.is_active
    })
  });
  showToast("Social link updated!", "success");
  await fetchPublicData();
}
