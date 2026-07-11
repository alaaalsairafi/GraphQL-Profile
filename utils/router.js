import { Auth } from '../auth/auth.js';

const app = document.getElementById('app');

export async function navigate(page) {
  app.innerHTML = '';

  if (page === 'login') {
    const { render } = await import('../auth/login.js');
    render(app);
  }

  if (page === 'profile') {
    const { render } = await import('../profile/profile.js');
    render(app);
  }
}

if (Auth.isLoggedIn()) {
  navigate('profile');
} else {
  navigate('login');
}