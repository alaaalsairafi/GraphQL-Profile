// utils/router.js
import { Auth } from '../auth/auth.js';

const app = document.getElementById('app');

const routes = {
  login:   () => import('../auth/login.js'),
  profile: () => import('../profile/profile.js'),
};

function currentPath() {
  return location.hash.replace(/^#\/?/, '');
}

// Redirects unauthorized/authorized-only pages to the right place
function guard(page) {
  if (page === 'profile' && !Auth.isLoggedIn()) return 'login';
  if (page === 'login'   &&  Auth.isLoggedIn()) return 'profile';
  return page;
}

export function navigate(page) {
  if (currentPath() === page) {
    render(page); // already on that hash, hashchange won't fire — render directly
  } else {
    location.hash = `/${page}`;
  }
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
    location.hash = `/${safePage}`;
    return;
  }

  app.innerHTML = '';
  const { render: renderPage } = await routes[safePage]();
  renderPage(app);
}

window.addEventListener('hashchange', () => render(currentPath()));

// ── Initial load ──
if (!location.hash) {
  location.hash = `/${Auth.isLoggedIn() ? 'profile' : 'login'}`; // triggers hashchange → render
} else {
  render(currentPath());
}