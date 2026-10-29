import { api } from './client';

export function fetchModerationComments({ status, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return api.get(`/articles/comments?${params.toString()}`);
}

export function setCommentStatus(id, status) {
  return api.patch(`/articles/comments/${id}`, { status });
}

export function deleteComment(id) {
  return api.del(`/articles/comments/${id}`);
}
