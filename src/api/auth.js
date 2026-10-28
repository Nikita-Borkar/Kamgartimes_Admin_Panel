import { request, ApiError } from './client';
import { saveSession, getAccessToken, getRefreshToken, clearSession, getCachedUser } from './session';

const ROLE_LABELS = {
  admin: 'Super Admin',
  editor: 'Senior Digital Editor',
  user: 'User',
};

const avatarFor = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Admin')}&background=dc2626&color=fff&bold=true&size=128`;

export function mapUser(rawUser) {
  return {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    roleKey: rawUser.role,
    role: ROLE_LABELS[rawUser.role] || rawUser.role,
    permissions: rawUser.permissions || [],
    avatar: avatarFor(rawUser.name),
  };
}

export async function loginUser(email, password, rememberMe) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });

  const user = mapUser(data.user);
  saveSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    rememberMe,
    user,
  });
  return user;
}

export async function restoreSession() {
  if (!getAccessToken() && !getRefreshToken()) return null;

  const cached = getCachedUser();
  if (!cached) {
    clearSession();
    return null;
  }

  try {
    // 401 triggers an automatic token refresh + retry inside the client
    const claims = await request('/auth/me');
    return {
      ...cached,
      roleKey: claims.role,
      role: ROLE_LABELS[claims.role] || cached.role,
      permissions: Array.isArray(claims.permissions) ? claims.permissions : cached.permissions,
    };
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401) {
      clearSession();
      return null;
    }
    // Network/server hiccup — keep the cached session rather than logging out
    return cached;
  }
}

export { clearSession };
