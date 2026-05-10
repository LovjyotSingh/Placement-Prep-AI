const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function clearLegacyAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveAuth(token, user) {
  clearLegacyAuth();
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user || {}));
}

export function clearAuth() {
  clearLegacyAuth();
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
