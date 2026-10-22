import { api } from './client';

/* --------------------------------- articles -------------------------------- */

export async function fetchArticles({ status, category, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  const qs = params.toString();
  return api.get(`/articles${qs ? `?${qs}` : ''}`);
}

export function fetchArticle(id) {
  return api.get(`/articles/${id}`);
}

export function createArticle(body) {
  return api.post('/articles', body);
}

export function updateArticle(id, body) {
  return api.put(`/articles/${id}`, body);
}

export function updateArticleStatus(id, status) {
  return api.patch(`/articles/${id}/status`, { status });
}

export function deleteArticle(id) {
  return api.del(`/articles/${id}`);
}

/* ---------------------------- featured-image upload ------------------------ */
// Articles are JSON-only; the image goes through the media library first and
// we take back its Cloudinary URL to use as `featuredImage`.

export async function uploadArticleImage(file, { title, altText = '' } = {}) {
  const form = new FormData();
  form.append('image', file);
  form.append('title', title || file.name || 'Article image');
  form.append('altText', altText);
  form.append('status', 'PUBLISHED');
  const data = await api.post('/media/images', form);
  return data?.url || data?.image?.url || '';
}
