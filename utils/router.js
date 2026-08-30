// utils/router.js
import { Auth } from '../auth/auth.js';

const app = document.getElementById('app');

// Repo name only matters as a URL prefix when actually deployed on GitHub Pages
const BASE = location.hostname.endsWith('github.io') ? '/GraphQL-Profile' : '';

const routes = {
  login:   () => import('../auth/login.js'),
  profile: () => import('../profile/profile.js'),
};

function currentPath() {
  let path = location.pathname;
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
  return path.replace(/^\/+|\/+$/g, ''); // strip leading/trailing slashes
}

// Redirects unauthorized/authorized-only pages to the right place
function guard(page) {
  if (page === 'profile' && !Auth.isLoggedIn()) return 'login';
  if (page === 'login'   &&  Auth.isLoggedIn()) return 'profile';
  return page;
}

export function navigate(page) {
  if (currentPath() === page) {
    render(page); // already there, popstate won't fire — render directly
    return;
  }
  history.pushState(null, '', `${BASE}/${page}`);
  render(page);
}

async function render(path) {
  if (!routes[path]) {
    app.innerHTML = '';
    const { render: renderPage } = await import('../pages/notfound.js');
    renderPage(app, path);
    return;
  }

  const safePage = guard(path);
  if (safePage !== path) {
    history.replaceState(null, '', `${BASE}/${safePage}`);
    render(safePage);
    return;
  }

  app.innerHTML = '';
  const { render: renderPage } = await routes[safePage]();
  renderPage(app);
}

window.addEventListener('popstate', () => render(currentPath()));

// ── Initial load ──
const initial = currentPath();
if (!initial) {
  const startPage = Auth.isLoggedIn() ? 'profile' : 'login';
  history.replaceState(null, '', `${BASE}/${startPage}`);
  render(startPage);
} else {
  render(initial);
}