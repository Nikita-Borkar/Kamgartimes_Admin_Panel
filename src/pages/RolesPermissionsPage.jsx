import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, PlusCircle, Edit3, Trash2, Users, KeyRound, X,
  CheckCircle2, AlertCircle, Lock, RefreshCw, ChevronDown, Loader2
} from 'lucide-react';
import { fetchRoles, fetchPermissionGroups, createRole, updateRole, deleteRole, fetchUsers, assignUserRole } from '../api/roles';
import { hasPermission } from '../utils/permissions';

/* ----------------------------- Permission Picker ----------------------------- */

function PermissionPicker({ groups, selected, onChange }) {
  const selectedSet = new Set(selected);

  const togglePermission = (value) => {
    const next = new Set(selectedSet);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange([...next]);
  };

  const toggleGroup = (groupPermissions, allChecked) => {
    const next = new Set(selectedSet);
    groupPermissions.forEach((p) => {
      if (allChecked) next.delete(p.value);
      else next.add(p.value);
    });
    onChange([...next]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {groups.map((group) => {
        const perms = group.permissions || [];
        const selectedCount = perms.filter((p) => selectedSet.has(p.value)).length;
        const allChecked = perms.length > 0 && selectedCount === perms.length;

        return (
          <div key={group.resource} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer select-none group/head">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => toggleGroup(perms, allChecked)}
                  className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200 group-hover/head:text-white">{group.label}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">{selectedCount}/{perms.length}</span>
            </label>

            <div className="flex flex-wrap gap-1.5">
              {perms.map((perm) => {
                const checked = selectedSet.has(perm.value);
                return (
                  <button
                    key={perm.value}
                    type="button"
                    onClick={() => togglePermission(perm.value)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-150 ${
                      checked
                        ? 'bg-red-500/15 border-red-500/50 text-white'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                    title={perm.value}
                  >
                    {perm.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Page ----------------------------------- */

export default function RolesPermissionsPage({ user, showToast }) {
  const canCreate = hasPermission(user, 'role:create');
  const canUpdate = hasPermission(user, 'role:update');
  const canDelete = hasPermission(user, 'role:delete');
  const canReadUsers = hasPermission(user, 'user:read');
  const canAssign = hasPermission(user, 'user:assign_role');

  const [view, setView] = useState('roles');

  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Create form
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit modal
  const [editingRole, setEditingRole] = useState(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPerms, setEditPerms] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal
  const [deletingRole, setDeletingRole] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Users view
  const [users, setUsers] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [roleDrafts, setRoleDrafts] = useState({});

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [rolesData, permsData] = await Promise.all([
        fetchRoles(),
        fetchPermissionGroups().catch(() => ({ groups: [] })),
      ]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setGroups(permsData?.groups || []);
    } catch (err) {
      setPageError(err?.message || 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsersError(err?.message || 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'users' && canReadUsers && users === null) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, canReadUsers]);

  const handleNameChange = (value) => {
    setName(value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name || !displayName) {
      setFormError('Role name and display name are required.');
      return;
    }
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
      setFormError('Role name must start with a letter and contain only lowercase letters, numbers and underscores.');
      return;
    }

    setCreating(true);
    try {
      await createRole({ name, displayName, description, permissions: selectedPerms });
      showToast(`Role "${displayName}" created successfully!`, 'success');
      setName('');
      setDisplayName('');
      setDescription('');
      setSelectedPerms([]);
      await loadRoles();
    } catch (err) {
      setFormError(err?.message || 'Failed to create role.');
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setEditDisplayName(role.displayName || '');
    setEditDescription(role.description || '');
    setEditPerms([...(role.permissions || [])]);
    setEditError('');
  };

  const handleSaveEdit = async () => {
    setEditError('');
    setSavingEdit(true);
    try {
      await updateRole(editingRole._id, {
        displayName: editDisplayName,
        description: editDescription,
        permissions: editPerms,
      });
      showToast(`Role "${editDisplayName}" updated successfully!`, 'success');
      setEditingRole(null);
      await loadRoles();
    } catch (err) {
      setEditError(err?.message || 'Failed to update role.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteRole(deletingRole._id);
      showToast(`Role "${deletingRole.displayName}" deleted.`, 'warning');
      setDeletingRole(null);
      await loadRoles();
    } catch (err) {
      setDeleteError(err?.message || 'Failed to delete role.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAssign = async (targetUser) => {
    const nextRole = roleDrafts[targetUser._id];
    if (!nextRole || nextRole === targetUser.role) return;

    setAssigningId(targetUser._id);
    try {
      await assignUserRole(targetUser._id, nextRole);
      showToast(`${targetUser.name}'s role changed to "${nextRole}".`, 'success');
      setUsers((prev) => prev.map((u) => (u._id === targetUser._id ? { ...u, role: nextRole } : u)));
      setRoleDrafts((prev) => {
        const next = { ...prev };
        delete next[targetUser._id];
        return next;
      });
    } catch (err) {
      showToast(err?.message || 'Failed to assign role.', 'error');
    } finally {
      setAssigningId(null);
    }
  };

  const activeRoles = roles.filter((r) => r.isActive !== false);

  return (
    <div className="space-y-6">

      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-500" />
            Roles &amp; Permissions Manager
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create roles, grant granular module permissions and assign roles to staff accounts.
          </p>
        </div>
        <button
          onClick={loadRoles}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Internal View Switcher */}
      <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 inline-flex gap-1.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setView('roles')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            view === 'roles'
              ? 'bg-red-600/20 border border-red-500/50 text-white'
              : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" /> Roles
        </button>
        {canReadUsers && (
          <button
            type="button"
            onClick={() => setView('users')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              view === 'users'
                ? 'bg-amber-500/20 border border-amber-500/50 text-white'
                : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Users
          </button>
        )}
      </div>

      {pageError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}

      {/* ================================ ROLES VIEW ================================ */}
      {view === 'roles' && (
        <>
          {/* Create Role Form */}
          {canCreate && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-500" /> Create New Role
              </h3>

              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-slate-300">Role Key*</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. content_lead"
                      required
                      className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs font-mono text-white outline-none"
                    />
                    <p className="text-[10px] text-slate-500">Lowercase letters, numbers, underscores. Cannot be changed later.</p>
                  </div>
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-slate-300">Display Name*</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Content Lead"
                      required
                      maxLength={100}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-slate-300">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional short description"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Module Permissions</label>
                    <span className="text-[10px] font-mono text-amber-400">{selectedPerms.length} selected</span>
                  </div>
                  {groups.length > 0 ? (
                    <PermissionPicker groups={groups} selected={selectedPerms} onChange={setSelectedPerms} />
                  ) : (
                    <p className="text-xs text-slate-500">Loading permission catalog...</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {creating ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating...</span>
                    ) : (
                      <><PlusCircle className="w-4 h-4" /> Create Role</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Roles Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading roles...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {roles.map((role) => {
                const isLockedAdmin = Boolean(role.isSystem && role.name === 'admin');
                const canEditThis = canUpdate && !isLockedAdmin;
                const canDeleteThis = canDelete && !role.isSystem;

                return (
                  <div key={role._id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg hover:border-slate-700 transition space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{role.displayName}</h4>
                        <p className="text-[10px] font-mono text-slate-500 truncate">{role.name}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {role.isSystem ? (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">System</span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Custom</span>
                        )}
                        {role.isActive === false && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">Inactive</span>
                        )}
                      </div>
                    </div>

                    {role.description && (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{role.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/70">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                        <KeyRound className="w-3 h-3 text-red-400" />
                        {role.permissions?.length || 0} permissions
                      </span>

                      <div className="flex items-center gap-1">
                        {isLockedAdmin ? (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 px-1.5 py-1" title="The admin role cannot be modified">
                            <Lock className="w-3 h-3" /> Protected
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => canEditThis && openEditModal(role)}
                              disabled={!canEditThis}
                              className={`p-1.5 rounded-lg transition ${canEditThis ? 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10' : 'text-slate-700 cursor-not-allowed'}`}
                              title={canEditThis ? 'Edit role permissions' : 'Requires role:update permission'}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => canDeleteThis && setDeletingRole(role)}
                              disabled={!canDeleteThis}
                              className={`p-1.5 rounded-lg transition ${canDeleteThis ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-700 cursor-not-allowed'}`}
                              title={role.isSystem ? 'System roles cannot be deleted' : canDelete ? 'Delete role' : 'Requires role:delete permission'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {roles.length === 0 && (
                <div className="col-span-full py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  No roles found. Create your first role above.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ================================ USERS VIEW ================================ */}
      {view === 'users' && canReadUsers && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" /> User Role Assignment
            </h3>
            <button
              onClick={loadUsers}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh users"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {usersError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{usersError}</span>
            </div>
          )}

          {usersLoading && users === null ? (
            <div className="flex items-center justify-center py-12 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading users...
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-2">
              {users.map((u) => {
                const draft = roleDrafts[u._id] ?? u.role;
                const changed = draft !== u.role;
                const isSelf = u._id === user?.id;

                return (
                  <div key={u._id} className="flex flex-wrap items-center gap-3 bg-slate-950/40 border border-slate-800 rounded-2xl p-3">
                    <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(u.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">
                        {u.name}
                        {isSelf && <span className="ml-2 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase">You</span>}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    </div>

                    {!u.isActive && (
                      <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">Inactive</span>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <div className="relative">
                        <select
                          value={draft}
                          onChange={(e) => setRoleDrafts((prev) => ({ ...prev, [u._id]: e.target.value }))}
                          disabled={!canAssign || assigningId === u._id}
                          className="appearance-none bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl pl-3 pr-8 py-2 text-xs text-white outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {activeRoles.map((r) => (
                            <option key={r._id} value={r.name}>{r.displayName}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <button
                        onClick={() => handleAssign(u)}
                        disabled={!canAssign || !changed || assigningId === u._id}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                          canAssign && changed && assigningId !== u._id
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white shadow-lg'
                            : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                        }`}
                        title={!canAssign ? 'Requires user:assign_role permission' : !changed ? 'Select a different role first' : 'Assign role'}
                      >
                        {assigningId === u._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Assign
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !usersError && (
              <div className="py-10 text-center text-xs text-slate-500">No users found.</div>
            )
          )}
        </div>
      )}

      {/* ================================ EDIT MODAL ================================ */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative">

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" /> Edit Role
                <span className="text-[10px] font-mono text-slate-500 ml-1">{editingRole.name}</span>
              </h4>
              <button
                onClick={() => setEditingRole(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Display Name</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    maxLength={100}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Description</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Module Permissions</label>
                  <span className="text-[10px] font-mono text-amber-400">{editPerms.length} selected</span>
                </div>
                {groups.length > 0 ? (
                  <PermissionPicker groups={groups} selected={editPerms} onChange={setEditPerms} />
                ) : (
                  <p className="text-xs text-slate-500">Loading permission catalog...</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================ DELETE MODAL ================================ */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" /> Delete Role
              </h4>
              <button onClick={() => setDeletingRole(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteError ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{deleteError}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete the role{' '}
                <span className="font-bold text-white">{deletingRole.displayName}</span>{' '}
                <span className="font-mono text-slate-400">({deletingRole.name})</span>? This role must not be assigned to any users.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingRole(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
