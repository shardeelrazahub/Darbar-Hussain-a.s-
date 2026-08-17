/* ==========================================================================
   ADMIN PORTAL MASTER ORCHESTRATOR
   ========================================================================== */

function showAdminLogin() {
  window.location.hash = '#admin-login';
  const pub = document.getElementById('public-app');
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dashboard-view');

  if (pub) pub.style.display = 'none';
  if (loginView) loginView.style.display = 'flex';
  if (dashView) dashView.style.display = 'none';

  if (typeof switchAuthTab === 'function') {
    switchAuthTab('login');
  }
}

// Global window mappings for HTML onclick handlers
window.showAdminLogin = showAdminLogin;
window.showAdminDashboard = showAdminDashboard;
window.switchAdminTab = switchAdminTab;
window.handleAdminLogin = handleAdminLogin;
window.handleAdminSignup = handleAdminSignup;
window.handleAdminVerifyEmail = handleAdminVerifyEmail;
window.handleResendVerificationCode = handleResendVerificationCode;
window.handleResendVerificationLink = handleResendVerificationLink;
window.checkEmailVerificationLink = checkEmailVerificationLink;
window.handleAdminLogout = handleAdminLogout;
window.switchAuthTab = switchAuthTab;
window.togglePasswordVisibility = togglePasswordVisibility;
window.saveWebsiteSettings = saveWebsiteSettings;
window.applyPresetTheme = applyPresetTheme;
window.handleLogoUpload = handleLogoUpload;
window.savePageContent = savePageContent;
window.openEventModal = openEventModal;
window.closeEventModal = closeEventModal;
window.editEventModal = editEventModal;
window.saveEventForm = saveEventForm;
window.deleteEvent = deleteEvent;
window.openAnnouncementModal = openAnnouncementModal;
window.closeAnnouncementModal = closeAnnouncementModal;
window.saveAnnouncementForm = saveAnnouncementForm;
window.deleteAnnouncement = deleteAnnouncement;
window.handleGalleryUpload = handleGalleryUpload;
window.deleteGalleryImage = deleteGalleryImage;
window.handleFileUpload = handleFileUpload;
window.openMediaModal = openMediaModal;
window.closeMediaModal = closeMediaModal;
window.saveMediaForm = saveMediaForm;
window.deleteMediaItem = deleteMediaItem;
window.updateSocialLink = updateSocialLink;
window.markMessageRead = markMessageRead;
window.deleteMessage = deleteMessage;
window.deleteVisitorPost = deleteVisitorPost;
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.saveUserForm = saveUserForm;
window.deleteAdminUser = deleteAdminUser;
window.approveAdminUser = approveAdminUser;
window.rejectAdminUser = rejectAdminUser;
window.handleProfileAvatarUpload = handleProfileAvatarUpload;
window.saveAdminProfile = saveAdminProfile;

