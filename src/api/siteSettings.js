import { api } from './client';

/* ------------------------------ Site Setting ------------------------------ */
// Singleton document: GET returns it (auto-creates on first read), PUT upserts.
// Settings updates preserve omitted scalar values. socialLinks is fully
// replaced when present.

export async function fetchSiteSetting() {
  // data = { _id, siteName, tagline, logoUrl, socialLinks[], contactEmail,
  //          contactPhone, address, isMaintenanceMode, ... }
  return api.get('/site-setting');
}

export async function updateSiteSetting(payload) {
  // payload: { siteName?, tagline?, contactEmail?, contactPhone?, address?,
  //            isMaintenanceMode?, socialLinks? } — JSON only (no logo here)
  return api.put('/site-setting', payload);
}

// Logo lives in its own multipart request (field name `image`). Multipart
// bodies cannot carry the socialLinks/isMaintenanceMode fields (multer turns
// them into strings and the backend schema rejects that), so this request
// sends ONLY the file.
export async function uploadSiteLogo(file) {
  const fd = new FormData();
  fd.append('image', file);
  return api.put('/site-setting', fd);
}

export const SOCIAL_PLATFORMS = ['youtube', 'facebook', 'instagram', 'whatsapp', 'twitter', 'telegram'];
