export const Auth = (() => {
  const TOKEN_KEY = 'dp_jwt';

  function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  function decodeToken(token) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
  }

  function isLoggedIn() {
    const token = getToken();
    if (!token) return false;
    const payload = decodeToken(token);
    if (!payload) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp ? payload.exp > now : true;
  }

  function getUserId() {
    const token = getToken();
    if (!token) return null;
    const payload = decodeToken(token);
    return payload?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id'] ?? null;
  }

  return { setToken, getToken, clearToken, decodeToken, isLoggedIn, getUserId };
})();