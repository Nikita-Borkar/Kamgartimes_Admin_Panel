import { api } from './client';

export async function fetchVideos({ status, videoType, category, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (videoType) params.set('videoType', videoType);
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return api.get(`/media/videos?${params.toString()}`);
}

export function createVideo(body) {
  return api.post('/media/videos', body);
}

export function updateVideo(id, body) {
  return api.put(`/media/videos/${id}`, body);
}

export function deleteVideo(id) {
  return api.del(`/media/videos/${id}`);
}

/* ------------------------- client-side helpers ---------------------------- */
// Mirrors the backend's extractYoutubeId so the form can show a live
// thumbnail preview before saving.

export const YOUTUBE_URL_RE = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i;

export function extractYoutubeId(input) {
  const value = (input || '').trim();
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/i,
    /youtu\.be\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function youtubeThumbUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeEmbedUrl(video) {
  return video?.embedUrl || (video?.youtubeVideoID ? `https://www.youtube.com/embed/${video.youtubeVideoID}` : '');
}
