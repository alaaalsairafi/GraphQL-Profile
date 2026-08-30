// utils/router.js
import { Auth } from '../auth/auth.js';

const app = document.getElementById('app');

const routes = {
  login:   () => import('../auth/login.js'),
  profile: () => import('../profile/profile.js'),
};

function currentPage() {
  const hash = location.hash.replace(/^#\/?/, '');
  return routes[hash] ? hash : null;
}

// Redirects unauthorized/authorized-only pages to the right place
function guard(page) {
  if (page === 'profile' && !Auth.isLoggedIn()) return 'login';
  if (page === 'login'   &&  Auth.isLoggedIn()) return 'profile';
  return page;
}

export function navigate(page) {
  const target = `/${page}`;
  if (location.hash.replace(/^#\/?/, '') === page) {
    render(page); // already on that hash, hashchange won't fire — render directly
  } else {
    location.hash = target;
  }
}

async function render(page) {
  const safePage = guard(page);

  if (safePage !== page) {
    location.hash = `/${safePage}`;
    return;
  }

  app.innerHTML = '';
  const { render: renderPage } = await routes[safePage]();
  renderPage(app);
}

window.addEventListener('hashchange', () => {
  render(currentPage() ?? (Auth.isLoggedIn() ? 'profile' : 'login'));
});

// ── Initial load ──
const initialPage = currentPage() ?? (Auth.isLoggedIn() ? 'profile' : 'login');
if (!location.hash) {
  location.hash = `/${initialPage}`; // triggers hashchange → render
} else {
  render(initialPage);
}