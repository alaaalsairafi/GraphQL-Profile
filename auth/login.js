import { Auth } from './auth.js';
import { navigate } from '../utils/router.js';

const SIGNIN_URL = 'https://learn.reboot01.com/api/auth/signin';

export function render(container) {
  container.innerHTML = `
    <div class="login-bg">
      <div class="grid-lines"></div>
    </div>

    <div class="login-container">
      <div class="login-brand">
        <span class="brand-symbol">&lt;/&gt;</span>
        <h1 class="brand-name">GraphQL<span class="accent"></span></h1>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label for="identifier">Username or Email</label>
          <input
            type="text"
            id="identifier"
            placeholder="you@school.com"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button type="button" id="toggle-pw" aria-label="Show password">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-error" id="form-error" aria-live="polite"></div>

        <button type="button" id="btn-login" class="btn-login">
          <span class="btn-text">Sign In</span>
          <span class="btn-loader" hidden>
            <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  `;

  loadStyles('style/login.css');
  attachEvents();
}

function attachEvents() {
  const identifierEl = document.getElementById('identifier');
  const passwordEl   = document.getElementById('password');
  const errorEl      = document.getElementById('form-error');
  const btnLogin     = document.getElementById('btn-login');
  const btnText      = btnLogin.querySelector('.btn-text');
  const btnLoader    = btnLogin.querySelector('.btn-loader');
  const togglePwBtn  = document.getElementById('toggle-pw');

  togglePwBtn.addEventListener('click', () => {
    const isHidden = passwordEl.type === 'password';
    passwordEl.type = isHidden ? 'text' : 'password';
    togglePwBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });

  [identifierEl, passwordEl].forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnLogin.click();
    });
  });

  btnLogin.addEventListener('click', async () => {
    errorEl.textContent = '';

    const identifier = identifierEl.value.trim();
    const password   = passwordEl.value;

    if (!identifier || !password) {
      errorEl.textContent = 'Please fill in both fields.';
      return;
    }

    btnLogin.disabled = true;
    btnText.hidden    = true;
    btnLoader.hidden  = false;

    try {
      const token = await signIn(identifier, password);
      Auth.setToken(token);
      navigate('profile');
    } catch (err) {
      errorEl.textContent = err.message;
    } finally {
      btnLogin.disabled = false;
      btnText.hidden    = false;
      btnLoader.hidden  = true;
    }
  });
}

async function signIn(identifier, password) {
  const credentials = btoa(`${identifier}:${password}`);

  const res = await fetch(SIGNIN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401 || res.status === 403)
    throw new Error('Invalid credentials. Check your username/email and password.');
  if (!res.ok)
    throw new Error(`Server error (${res.status}). Please try again.`);

  const data  = await res.json();
  const token = typeof data === 'string' ? data : (data?.token ?? data?.jwt);
  if (!token) throw new Error('Unexpected server response. Please try again.');
  return token;
}

function loadStyles(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel   = 'stylesheet';
  link.href  = href;
  document.head.appendChild(link);
}