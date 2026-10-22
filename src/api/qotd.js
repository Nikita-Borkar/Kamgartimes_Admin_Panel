import { api } from './client';

/* --------------------------- question of the day --------------------------- */
// Delete is a SOFT delete (sets isActive=false). Dates on create/update must
// be strict ISO-8601 with timezone (use new Date(v).toISOString()); null
// clears the window. `category` is free text, not a Category ref.

export async function fetchQuestions({ isActive, category, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (isActive === 'active') params.set('isActive', 'true');
  if (isActive === 'inactive') params.set('isActive', 'false');
  if (category) params.set('category', category);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return api.get(`/question-of-the-day?${params.toString()}`);
}

export function fetchQuestion(id) {
  return api.get(`/question-of-the-day/${id}`);
}

export function createQuestion(body) {
  return api.post('/question-of-the-day', body);
}

export function updateQuestion(id, body) {
  return api.put(`/question-of-the-day/${id}`, body);
}

export function deleteQuestion(id) {
  return api.del(`/question-of-the-day/${id}`); // → { id, isActive: false }
}

export function fetchTodayQuestion(category) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  return api.get(`/public/question-of-the-day${qs}`, { auth: false });
}
