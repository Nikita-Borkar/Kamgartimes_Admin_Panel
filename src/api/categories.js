import { api } from './client';

export async function fetchCategories({ parent, isActive, page = 1, limit = 500 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (parent !== undefined) params.set('parent', parent);
  if (isActive !== undefined) params.set('isActive', String(isActive));
  const res = await api.get(`/categories?${params.toString()}`);
  if (Array.isArray(res)) {
    return { categories: res, total: res.length };
  }
  return res || { categories: [], total: 0 };
}

export async function fetchCategoryTree() {
  return api.get('/categories/tree');
}

export async function fetchSubcategories(categoryId) {
  return api.get(`/categories/${categoryId}/subcategories`);
}

export async function createCategory({ name, slug, parent, isActive }) {
  return api.post('/categories', { name, slug, parent, isActive });
}

export async function updateCategory(id, { name, slug, parent, isActive }) {
  const body = {};
  if (name !== undefined) body.name = name;
  if (slug !== undefined) body.slug = slug;
  if (parent !== undefined) body.parent = parent;
  if (isActive !== undefined) body.isActive = isActive;
  return api.put(`/categories/${id}`, body);
}

// Backend "delete" is a soft-deactivate (isActive=false)
export async function deleteCategory(id) {
  return api.del(`/categories/${id}`);
}
