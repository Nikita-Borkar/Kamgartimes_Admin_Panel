import { getAccessToken, getRefreshToken, saveAccessToken, clearSession } from './session';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, statusCode = 0, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;

    const json = await res.json().catch(() => null);
    const token = json?.data?.accessToken;
    if (!token) return false;

    saveAccessToken(token);
    return true;
  } catch {
    return false;
  }
}

function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function parseErrorMessage(body, fallback) {
  const message = body?.message || fallback;
  const fieldErrors = body?.error?.errors;
  if (Array.isArray(fieldErrors) && fieldErrors.length) {
    return fieldErrors.map((e) => e.message).join(' ');
  }
  return message;
}

export async function request(path, { method = 'GET', body, auth = true, _retry = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (isFormData) delete headers['Content-Type']; // browser sets the multipart boundary

  const token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection and try again.', 0);
  }

  const json = await res.json().catch(() => null);

  if (res.ok) {
    if (json && typeof json === 'object' && 'success' in json) {
      if (!json.success) {
        throw new ApiError(parseErrorMessage(json, 'Request failed'), json.statusCode || res.status);
      }
      return json.data;
    }
    return json;
  }

  if (res.status === 401 && auth && !_retry && getRefreshToken()) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      return request(path, { method, body, auth, _retry: true });
    }
    clearSession();
  }

  throw new ApiError(parseErrorMessage(json, 'Something went wrong. Please try again.'), res.status);
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
