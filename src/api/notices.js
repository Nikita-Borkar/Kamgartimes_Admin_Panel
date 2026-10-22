import { api } from './client';

/* --------------------------------- notices --------------------------------- */
// Activation = isActive flag + optional startsAt/endsAt window ("" clears a
// date). Public surface is ticker-only: GET /public/notices/ticker.

export async function fetchNotices({ isActive, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (isActive === 'active') params.set('isActive', 'true');
  if (isActive === 'inactive') params.set('isActive', 'false');
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return api.get(`/notices?${params.toString()}`);
}

export function fetchNotice(id) {
  return api.get(`/notices/${id}`);
}

export function createNotice(body) {
  return api.post('/notices', body);
}

export function updateNotice(id, body) {
  return api.put(`/notices/${id}`, body);
}

export function deleteNotice(id) {
  return api.del(`/notices/${id}`);
}

export function fetchNoticeTicker() {
  return api.get('/public/notices/ticker', { auth: false });
}
