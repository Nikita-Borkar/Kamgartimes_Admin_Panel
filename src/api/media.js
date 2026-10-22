import { api } from './client';

/* ------------------------------- media images ------------------------------ */
// Create is multipart (field `image`, multer, 10 MB, image/* only) plus text
// fields title (required), description, altText, status. Update is JSON and
// only mutates title/description/altText/status (URL is Cloudinary-owned).

export async function fetchImages({ status, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return api.get(`/media/images?${params.toString()}`);
}

export function fetchImage(id) {
  return api.get(`/media/images/${id}`);
}

export async function uploadImage(file, { title, description = '', altText = '', status = 'DRAFT' } = {}) {
  const form = new FormData();
  form.append('image', file);
  form.append('title', title || file.name || 'Untitled image');
  form.append('description', description);
  form.append('altText', altText);
  form.append('status', status);
  return api.post('/media/images', form);
}

export function updateImage(id, { title, description, altText, status }) {
  const body = {};
  if (title !== undefined) body.title = title;
  if (description !== undefined) body.description = description;
  if (altText !== undefined) body.altText = altText;
  if (status !== undefined) body.status = status;
  return api.put(`/media/images/${id}`, body);
}

export function deleteImage(id) {
  return api.del(`/media/images/${id}`);
}
