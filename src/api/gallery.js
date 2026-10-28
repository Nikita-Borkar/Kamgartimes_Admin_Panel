import { api } from './client';

export async function fetchGalleryItems({ page = 1, limit = 50, all = true } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (all) params.set('all', 'true');
  const res = await api.get(`/gallery?${params.toString()}`);
  return res?.items || res?.data || res || [];
}

export async function createGalleryItem(payload) {
  // payload: { title, mediaUrl, thumbnailUrl, mediaType, sourceType, caption, isPublished, showOnHome }
  return api.post('/gallery', payload);
}

export async function updateGalleryItem(id, payload) {
  return api.patch(`/gallery/${id}`, payload);
}

export async function deleteGalleryItem(id) {
  return api.del(`/gallery/${id}`);
}
