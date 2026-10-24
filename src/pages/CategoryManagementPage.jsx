import React, { useState } from 'react';
import {
  Layers, PlusCircle, Edit3, Trash2, X, AlertCircle, Loader2,
  CheckCircle2, RotateCcw, FolderTree, CornerDownRight, Archive
} from 'lucide-react';
import { buildCategoryTree, isActiveItem } from '../utils/categories';
import { hasPermission } from '../utils/permissions';

export default function CategoryManagementPage({
  categories,
  loading,
  user,
  showToast,
  onCreate,
  onUpdate,
  onDeactivate,
  onRestore
}) {
  const canCreate = hasPermission(user, 'category:create');
  const canUpdate = hasPermission(user, 'category:update');
  const canDelete = hasPermission(user, 'category:delete');

  const [type, setType] = useState('main'); // 'main' | 'sub'
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parent, setParent] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const [editing, setEditing] = useState(null); // category object
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editParent, setEditParent] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const [deactivating, setDeactivating] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const tree = buildCategoryTree(categories || []);
  const mainCategories = tree.filter(isActiveItem);

  const resetForm = () => {
    setName('');
    setSlug('');
    setParent('');
  };

  const handleTypeChange = (nextType) => {
    setType(nextType);
    setFormError('');
    if (nextType === 'main') setParent('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }
    if (type === 'sub' && !parent) {
      setFormError('Select a parent navigation category for this section.');
      return;
    }

    setCreating(true);
    try {
      const err = await onCreate({
        name: name.trim(),
        slug: slug.trim() || undefined,
        parent: type === 'sub' ? parent : undefined,
        isActive: true
      });
      if (err) {
        setFormError(err);
      } else {
        showToast(
          type === 'sub'
            ? `Section "${name.trim()}" added to navigation.`
            : `Navigation category "${name.trim()}" created!`,
          'success'
        );
        resetForm();
      }
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setEditName(cat.name || '');
    setEditSlug(cat.slug || '');
    setEditParent(cat.parent || '');
    setEditActive(isActiveItem(cat));
    setEditError('');
  };

  const handleSaveEdit = async () => {
    setEditError('');
    if (!editName.trim()) {
      setEditError('Category name is required.');
      return;
    }
    setSavingEdit(true);
    try {
      const err = await onUpdate(editing._id, {
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
        parent: editing.parent ? (editParent || null) : undefined,
        isActive: editActive
      });
      if (err) {
        setEditError(err);
      } else {
        showToast(`"${editName.trim()}" updated successfully!`, 'success');
        setEditing(null);
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeactivate = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      const err = await onDeactivate(deactivating._id);
      if (err) {
        setDeleteError(err);
      } else {
        showToast(`"${deactivating.name}" deactivated.`, 'warning');
        setDeactivating(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (cat) => {
    const err = await onRestore(cat._id);
    if (err) showToast(err, 'error');
    else showToast(`"${cat.name}" reactivated.`, 'success');
  };

  const MainRow = ({ cat }) => (
    <div className={`bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/70 rounded-xl p-2.5 flex flex-wrap items-center gap-2 ${isActiveItem(cat) ? '' : 'opacity-60'}`}>
      <CornerDownRight className="w-3.5 h-3.5 text-amber-500 shrink-0 hidden sm:block" />
      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono ml-2">/{cat.slug}</span>
      </div>
      {!isActiveItem(cat) && (
        <>
          <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded-full">Inactive</span>
          <button
            onClick={() => handleRestore(cat)}
            disabled={!canUpdate}
            className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition disabled:opacity-40"
            title={canUpdate ? 'Reactivate section' : 'Requires category:update permission'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      <button
        onClick={() => canUpdate && openEdit(cat)}
        disabled={!canUpdate}
        className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition disabled:opacity-40"
        title={canUpdate ? 'Edit section' : 'Requires category:update permission'}
      >
        <Edit3 className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => canDelete && setDeactivating(cat)}
        disabled={!canDelete || !isActiveItem(cat)}
        className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition disabled:opacity-40"
        title={canDelete ? 'Deactivate section' : 'Requires category:delete permission'}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl transition-colors duration-300">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-red-500" />
          Categories &amp; Subcategories Manager
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Categories power the main site navigation. Subcategories are the sections inside each category — pick both while publishing an article.
        </p>
      </div>

      {/* Add Form */}
      {canCreate && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-amber-500" /> Add Navigation Category / Section
          </h3>

          {/* Type Toggle */}
          <div className="bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 inline-flex gap-1.5">
            <button
              type="button"
              onClick={() => handleTypeChange('main')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                type === 'main'
                  ? 'bg-red-600/15 border border-red-500/40 text-red-600 dark:bg-red-600/20 dark:border-red-500/50 dark:text-white'
                  : 'border border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" /> Main Category (Navigation)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('sub')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                type === 'sub'
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-white'
                  : 'border border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <CornerDownRight className="w-3.5 h-3.5" /> Subcategory (Section)
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {type === 'sub' && (
              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Parent Category*</label>
                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition"
                >
                  <option value="">Select category...</option>
                  {mainCategories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={type === 'sub' ? 'sm:col-span-4 space-y-1' : 'sm:col-span-5 space-y-1'}>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{type === 'sub' ? 'Section Name*' : 'Category Name*'}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'sub' ? 'e.g. वेतन व भत्ते' : 'e.g. कामगार टाइम्स'}
                required
                maxLength={100}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="auto from name"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none transition"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                <span>Add</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tree View */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading categories...
        </div>
      ) : tree.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-transparent">
          No categories found. Create your first navigation category above.
        </div>
      ) : (
        <div className="space-y-4">
          {tree.map(cat => (
            <div key={cat._id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg space-y-3 transition ${isActiveItem(cat) ? 'hover:border-slate-300 dark:hover:border-slate-700' : 'opacity-70'}`}>

              {/* Main category header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-3 h-10 rounded-full shrink-0 ${isActiveItem(cat) ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                      {cat.name}
                      {!isActiveItem(cat) && (
                        <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-full">Inactive</span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">/{cat.slug} • {cat.subcategories.length} section{cat.subcategories.length === 1 ? '' : 's'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!isActiveItem(cat) && (
                    <button
                      onClick={() => handleRestore(cat)}
                      disabled={!canUpdate}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition disabled:opacity-40"
                      title={canUpdate ? 'Reactivate category' : 'Requires category:update permission'}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => canUpdate && openEdit(cat)}
                    disabled={!canUpdate}
                    className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition disabled:opacity-40"
                    title={canUpdate ? 'Edit category' : 'Requires category:update permission'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => canDelete && setDeactivating(cat)}
                    disabled={!canDelete}
                    className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition disabled:opacity-40"
                    title={canDelete ? 'Deactivate category' : 'Requires category:delete permission'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories (sections) */}
              {cat.subcategories.length > 0 && (
                <div className="space-y-1.5 pl-2 sm:pl-6">
                  {cat.subcategories.map(sub => (
                    <MainRow key={sub._id} cat={sub} />
                  ))}
                </div>
              )}

              {cat.subcategories.length === 0 && isActiveItem(cat) && (
                <p className="pl-2 sm:pl-6 text-[10px] text-slate-400 dark:text-slate-600 italic">
                  No sections yet — add a subcategory from the form above.
                </p>
              )}

            </div>
          ))}
        </div>
      )}

      {/* ================================ EDIT MODAL ================================ */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                {editing.parent ? 'Edit Section' : 'Edit Category'}
              </h4>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={100}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Slug (URL)</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none transition"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Leave blank to auto-generate from the name.</p>
              </div>

              {editing.parent && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Parent Category</label>
                  <select
                    value={editParent}
                    onChange={(e) => setEditParent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition"
                  >
                    <option value="">Select category...</option>
                    {mainCategories.filter(c => c._id !== editing._id).map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5 text-emerald-500" /> Active (visible on website)
                </span>
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

      {/* ============================ DEACTIVATE MODAL ============================ */}
      {deactivating && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" /> Deactivate {deactivating.parent ? 'Section' : 'Category'}
              </h4>
              <button onClick={() => { setDeactivating(null); setDeleteError(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteError ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{deleteError}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Deactivate <span className="font-bold text-slate-900 dark:text-white">{deactivating.name}</span>? It will be hidden from the website navigation and article forms. You can reactivate it anytime.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => { setDeactivating(null); setDeleteError(''); }}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
