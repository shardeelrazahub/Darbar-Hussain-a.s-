/* ==========================================================================
   TOAST NOTIFICATION MODULE
   ========================================================================== */

function showToast(msg, type = 'success', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'ri-checkbox-circle-fill';
  if (type === 'error') iconClass = 'ri-error-warning-fill';
  else if (type === 'info') iconClass = 'ri-information-fill';
  else if (type === 'warning') iconClass = 'ri-alert-fill';

  toast.innerHTML = `
    <i class="${iconClass}" style="font-size:1.3rem; flex-shrink:0;"></i>
    <span style="flex:1; line-height:1.4;">${msg}</span>
    <button onclick="this.parentElement.remove()" style="background:none; border:none; color:currentColor; cursor:pointer; opacity:0.7; font-size:1.2rem; line-height:1; padding:0 0 0 0.5rem;" aria-label="Close">&times;</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

// Global exposure
window.showToast = showToast;
