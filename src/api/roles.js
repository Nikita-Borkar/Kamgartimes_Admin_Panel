import { api } from './client';

export async function fetchRoles() {
  return api.get('/roles');
}

export async function fetchPermissionGroups() {
  // data = { groups, options, allPermissions }
  return api.get('/roles/permissions');
}

export async function createRole({ name, displayName, description, permissions }) {
  return api.post('/roles', { name, displayName, description, permissions });
}

export async function updateRole(id, { displayName, description, permissions }) {
  return api.put(`/roles/${id}`, { displayName, description, permissions });
}

export async function deleteRole(id) {
  return api.del(`/roles/${id}`);
}

export async function fetchUsers() {
  return api.get('/users');
}

export async function assignUserRole(userId, role) {
  return api.put(`/users/${userId}/role`, { role });
}
