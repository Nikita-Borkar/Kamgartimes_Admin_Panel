const KEYS = {
  access: 'kamgar_auth_access',
  refresh: 'kamgar_auth_refresh',
  remember: 'kamgar_auth_remember',
  user: 'kamgar_auth_user',
};

const rememberMeEnabled = () => localStorage.getItem(KEYS.remember) === 'true';

// "Keep me signed in" => localStorage (survives browser restart)
// otherwise => sessionStorage (cleared when the tab closes)
const persistentStore = () => localStorage;
const sessionStore = () => sessionStorage;
const activeStore = () => (rememberMeEnabled() ? localStorage : sessionStorage);

const read = (key) => {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
};

const clearAll = () => {
  [localStorage, sessionStorage].forEach((store) => {
    Object.values(KEYS).forEach((key) => store.removeItem(key));
  });
};

export function saveSession({ accessToken, refreshToken, rememberMe, user }) {
  clearAll();
  localStorage.setItem(KEYS.remember, String(Boolean(rememberMe)));
  const store = rememberMe ? persistentStore() : sessionStore();
  store.setItem(KEYS.access, accessToken || '');
  store.setItem(KEYS.refresh, refreshToken || '');
  if (user) store.setItem(KEYS.user, JSON.stringify(user));
}

export function getAccessToken() {
  return read(KEYS.access) || null;
}

export function getRefreshToken() {
  return read(KEYS.refresh) || null;
}

export function saveAccessToken(accessToken) {
  activeStore().setItem(KEYS.access, accessToken);
}

export function getCachedUser() {
  const raw = read(KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  clearAll();
}
