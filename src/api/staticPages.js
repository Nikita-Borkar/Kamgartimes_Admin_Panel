import { api } from './client';

/* ------------------------------- Static Pages ----------------------------- */
// A page is a free-form HTML document (content is stored raw — sanitize on
// render in any consumer). Publish flag is `isActive` (DELETE soft-deletes).

export async function fetchStaticPages({ isActive, search, showInFooter, showInHeader, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (isActive !== undefined) params.set('isActive', String(isActive));
  if (search) params.set('search', search);
  if (showInFooter !== undefined) params.set('showInFooter', String(showInFooter));
  if (showInHeader !== undefined) params.set('showInHeader', String(showInHeader));
  // data = { pages, total, page, limit } — sorted by sortOrder then title
  return api.get(`/static-pages?${params.toString()}`);
}

export async function fetchStaticPage(id) {
  // data = full doc, createdBy/updatedBy populated as { _id, name }
  return api.get(`/static-pages/${id}`);
}

export async function createStaticPage(payload) {
  // payload: { title, slug?, content, excerpt?, isActive?, showInFooter?,
  //            showInHeader?, sortOrder?, seo? { metaTitle, metaDescription } }
  return api.post('/static-pages', payload);
}

export async function updateStaticPage(id, payload) {
  // NB: if slug is omitted and title changes, the backend regenerates the slug
  return api.put(`/static-pages/${id}`, payload);
}

// Soft delete — sets isActive=false (permanent row, no hard delete exists)
export async function deleteStaticPage(id) {
  return api.del(`/static-pages/${id}`);
}
