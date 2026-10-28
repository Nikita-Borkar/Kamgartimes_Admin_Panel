import { api } from './client';

/* -------------------------------- live news ------------------------------- */
// Admin CRUD is gated by liveNews:* permissions. Activation = isActive flag +
// optional publishedAt go-live time (empty/null = live immediately).

export async function fetchLiveNews({ isActive, category, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (isActive === 'active') params.set('isActive', 'true');
  if (isActive === 'inactive') params.set('isActive', 'false');
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return api.get(`/live-news?${params.toString()}`);
}

export function fetchLiveNewsItem(id) {
  return api.get(`/live-news/${id}`);
}

export function createLiveNews(body) {
  return api.post('/live-news', body);
}

export function updateLiveNews(id, body) {
  return api.put(`/live-news/${id}`, body);
}

export function deleteLiveNews(id) {
  return api.del(`/live-news/${id}`);
}

/* -------------------------------- public feed ----------------------------- */
// Active items whose go-live window has started, ordered by priority desc.

export async function fetchLiveNewsTicker({ limit = 20 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  return api.get(`/public/live-news?${params.toString()}`, { auth: false });
}

/* --------------------------- latest news ticker --------------------------- */
// Derived from published articles in the last 24 hours (newest first).

export async function fetchLatestNewsTicker({ limit = 20, category, categorySlug } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) params.set('category', category);
  if (categorySlug) params.set('categorySlug', categorySlug);
  return api.get(`/public/articles/ticker?${params.toString()}`, { auth: false });
}
