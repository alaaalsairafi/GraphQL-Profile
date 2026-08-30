// pages/notfound.js
import { navigate } from '../utils/router.js';
import { Auth } from '../auth/auth.js';

export function render(container, attemptedPath = '') {
  loadStyles('style/notfound.css');

  container.innerHTML = `
    <div class="nf-bg">
      <div class="grid-lines"></div>
    </div>
    <div class="nf-container">
      <span class="nf-code">404</span>
      <h1 class="nf-title">Page not found</h1>
      <p class="nf-sub">
        ${attemptedPath ? `<code>#/${attemptedPath}</code> doesn't exist.` : `That route doesn't exist.`}
      </p>
      <button id="nf-back" class="nf-btn">Back to safety</button>
    </div>
  `;

  document.getElementById('nf-back').addEventListener('click', () => {
    navigate(Auth.isLoggedIn() ? 'profile' : 'login');
  });
}

function loadStyles(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}