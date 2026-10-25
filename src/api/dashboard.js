import { api } from './client';

export function fetchDashboard(range = '30d') {
  return api.get(`/dashboard?range=${encodeURIComponent(range)}`);
}
