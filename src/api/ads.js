import { api } from './client';

/* ------------------------------- Ad Slots -------------------------------- */
// A slot = a fixed position on the reader site (hero, sidebar, footer...)
// with a pixel size. Slots are what the public site requests by `key`.

export async function fetchAdSlots({ isActive, section, search, page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (isActive !== undefined) params.set('isActive', String(isActive));
  if (section) params.set('section', section);
  if (search) params.set('search', search);
  // data = { slots, total, page, limit }
  return api.get(`/ad-slots?${params.toString()}`);
}

export async function createAdSlot(payload) {
  return api.post('/ad-slots', payload);
}

export async function updateAdSlot(id, payload) {
  return api.put(`/ad-slots/${id}`, payload);
}

// Soft delete — sets isActive=false so placements are not orphaned
export async function deleteAdSlot(id) {
  return api.del(`/ad-slots/${id}`);
}

/* ------------------------------ Ad Campaigns ------------------------------ */
// A campaign = the creative (Cloudinary image + click URL). Mutations are
// multipart/form-data; the image file field must be named `image`.

export async function fetchAdCampaigns({ isActive, search, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (isActive !== undefined) params.set('isActive', String(isActive));
  if (search) params.set('search', search);
  // data = { campaigns, total, page, limit }
  return api.get(`/ad-campaigns?${params.toString()}`);
}

export async function fetchAdCampaign(id) {
  return api.get(`/ad-campaigns/${id}`);
}

export async function createAdCampaign(formData) {
  // formData: title, clickUrl, image (File), imageAlt?, target?, priority?, isActive?, startDate?, endDate?
  return api.post('/ad-campaigns', formData);
}

export async function updateAdCampaign(id, formData) {
  // image optional — omit to keep the existing creative
  return api.put(`/ad-campaigns/${id}`, formData);
}

// Soft delete — sets isActive=false (asset + stats retained)
export async function deleteAdCampaign(id) {
  return api.del(`/ad-campaigns/${id}`);
}

/* ------------------------------ Ad Placements ----------------------------- */
// A placement = which campaign runs in which slot, with schedule + rotation weight.

export async function fetchAdPlacements({ adSlot, adCampaign, isActive, page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (adSlot) params.set('adSlot', adSlot);
  if (adCampaign) params.set('adCampaign', adCampaign);
  if (isActive !== undefined) params.set('isActive', String(isActive));
  // data = { placements, total, page, limit }
  return api.get(`/ad-placements?${params.toString()}`);
}

export async function createAdPlacement(payload) {
  return api.post('/ad-placements', payload);
}

export async function updateAdPlacement(id, payload) {
  return api.put(`/ad-placements/${id}`, payload);
}

// Hard delete — placement is removed permanently
export async function deleteAdPlacement(id) {
  return api.del(`/ad-placements/${id}`);
}

/* -------------------------------- Ad Stats -------------------------------- */

export async function fetchAdClickStats({ campaign, slot, from, to } = {}) {
  const params = new URLSearchParams();
  if (campaign) params.set('campaign', campaign);
  if (slot) params.set('slot', slot);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  // data = { total, range, byCampaign[], bySlot[], byDay[] }
  return api.get(`/ad-stats/clicks${qs ? `?${qs}` : ''}`);
}
