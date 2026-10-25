import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio, Plus, Search, Trash2, Edit3, AlertCircle, Loader2, RefreshCw,
  CheckCircle2, X, Link as LinkIcon, CalendarClock, ExternalLink, Tag, Info
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { fetchLiveNews, createLiveNews, updateLiveNews, deleteLiveNews } from '../api/liveNews';
import { hasPermission } from '../utils/permissions';

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

const PRIORITIES = [
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Urgent' }
];

const PRIORITY_STYLES = {
  0: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  1: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  2: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
  3: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 animate-pulse'
};

const PRIORITY_LABELS = { 0: 'LOW', 1: 'MEDIUM', 2: 'HIGH', 3: 'URGENT' };

const fmtDateTime = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime()) || dt.getFullYear() < 2000) return null;
  return dt.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const toLocalInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime()) || dt.getFullYear() < 2000) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

// Backend DTO expects strict ISO-8601 with timezone.
const toIso = (local) => (local ? new Date(local).toISOString() : null);

const scheduleOf = (d) => {
  if (!d) return { live: true, at: null };
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime()) || dt.getFullYear() < 2000) return { live: true, at: null };
  return { live: dt.getTime() <= Date.now(), at: d };
};

const EMPTY_FORM = {
  heading: '', linkText: 'Read More', linkUrl: '', category: '',
  priority: 1, isActive: true, publishedAt: ''
};

export default function LiveNewsPage({ categories = [], user, showToast }) {
  const canCreate = hasPermission(user, 'liveNews:create');
  const canUpdate = hasPermission(user, 'liveNews:update');
  const canDelete = hasPermission(user, 'liveNews:delete');

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', item }
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchLiveNews({
        isActive: activeFilter || undefined,
        category: categoryFilter || undefined,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setItems([]);
      setTotal(0);
      setLoadError(errOf(err));
    } finally {
      setLoading(false);
    }
  }, [activeFilter, categoryFilter, debouncedSearch, currentPage, itemsPerPage]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  const categoryOptions = categories.filter(
    (c) => c.isActive !== false || String(c._id) === String(form.category)
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModal({ mode: 'create' });
  };

  const openEdit = (item) => {
    setForm({
      heading: item.heading || '',
      linkText: item.linkText || 'Read More',
      linkUrl: item.linkUrl || '',
      category: item.category?._id || item.category || '',
      priority: Number.isFinite(item.priority) ? item.priority : 0,
      isActive: item.isActive !== false,
      publishedAt: toLocalInput(item.publishedAt)
    });
    setFormErrors({});
    setModal({ mode: 'edit', item });
  };

  const validate = () => {
    const next = {};
    if (!form.heading.trim()) next.heading = 'Heading is required.';
    else if (form.heading.trim().length > 250) next.heading = 'Heading must be 250 characters or fewer.';

    const url = form.linkUrl.trim();
    if (!url) next.linkUrl = 'Destination link is required.';
    else if (url.length > 1000) next.linkUrl = 'Link must be 1000 characters or fewer.';
    else if (!/^(https?:\/\/|\/)/i.test(url)) {
      next.linkUrl = 'Use an absolute URL (https://…) or a site path (/news/…).';
    }

    if (!form.category) next.category = 'Category is required.';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (saving || !validate()) return;
    setSaving(true);

    const body = {
      heading: form.heading.trim(),
      linkText: form.linkText.trim() || 'Read More',
      linkUrl: form.linkUrl.trim(),
      category: form.category,
      isActive: form.isActive,
      priority: Number(form.priority)
    };
    if (form.publishedAt) body.publishedAt = toIso(form.publishedAt);
    else if (modal?.mode === 'edit') body.publishedAt = null;

    try {
      if (modal?.mode === 'edit') {
        await updateLiveNews(modal.item._id, body);
        showToast?.('Live news updated.', 'success');
      } else {
        await createLiveNews(body);
        showToast?.('Live news created.', 'success');
      }
      setModal(null);
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    if (togglingId) return;
    setTogglingId(item._id);
    try {
      await updateLiveNews(item._id, { isActive: !item.isActive });
      showToast?.(item.isActive ? 'Live news deactivated.' : 'Live news activated.', 'success');
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    try {
      await deleteLiveNews(deleting._id);
      showToast?.('Live news deleted.', 'warning');
      setDeleting(null);
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  const fieldCls = (bad) =>
    `w-full bg-slate-50 dark:bg-slate-950 border ${bad ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition`;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl transition-colors duration-300">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500" /> Live News
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage breaking live headlines shown on the reader site rail and mobile app.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreate}
            className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition duration-200 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>New Live News</span>
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/25 text-blue-700 dark:text-blue-300 rounded-2xl px-4 py-3 text-[11px] sm:text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Live news appears on the public feed only when it is <strong>Active</strong> and its go-live time has passed.
          Leave the go-live field empty to publish immediately. Higher priority items are shown first.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center transition-colors duration-300">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by heading..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}{c.isActive === false ? ' (Inactive)' : ''}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none transition"
          >
            <option value="">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Live news list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Total Live News: <strong className="text-slate-900 dark:text-white">{total}</strong></span>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loadError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-bold">
            <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {loadError}</span>
            <button onClick={load} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shrink-0">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <span className="text-xs">Loading live news...</span>
          </div>
        ) : items.length === 0 && !loadError ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Radio className="w-8 h-8" />
            <span>No live news found. Create your first live headline to alert readers.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const schedule = scheduleOf(item.publishedAt);
              return (
                <div
                  key={item._id}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  {/* Priority + status */}
                  <div className="flex items-center gap-2 sm:w-40 shrink-0">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES[0]}`}>
                      {PRIORITY_LABELS[item.priority] ?? `P${item.priority}`}
                    </span>
                    <button
                      onClick={() => handleToggleActive(item)}
                      disabled={!canUpdate || togglingId === item._id}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition disabled:opacity-50 ${
                        item.isActive
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                      title={canUpdate ? 'Click to toggle active status' : 'You do not have permission to edit live news'}
                    >
                      {togglingId === item._id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />}
                      {item.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{item.heading}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 text-[10px] text-slate-400">
                      {item.category?.name && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                          <Tag className="w-3 h-3" /> {item.category.name}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 font-semibold ${schedule.live ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        <CalendarClock className="w-3 h-3" />
                        {schedule.live
                          ? (schedule.at ? `Live since ${fmtDateTime(schedule.at)}` : 'Live immediately')
                          : `Goes live ${fmtDateTime(schedule.at)}`}
                      </span>
                      {item.linkUrl && (
                        <a href={item.linkUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                          <LinkIcon className="w-3 h-3" /> {item.linkText || 'Link'} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {item.createdBy?.name && <span>by {item.createdBy.name}</span>}
                      <span>{fmtDateTime(item.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {(canUpdate || canDelete) && (
                    <div className="flex items-center gap-2 shrink-0">
                      {canUpdate && (
                        <button
                          onClick={() => openEdit(item)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                      {canUpdate && canDelete && <span className="text-slate-300 dark:text-slate-700">|</span>}
                      {canDelete && (
                        <button
                          onClick={() => setDeleting(item)}
                          className="text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && !loadError && total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full my-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-600" />
                {modal.mode === 'edit' ? 'Edit Live News' : 'New Live News'}
              </h3>
              <button onClick={() => !saving && setModal(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Heading *</label>
                <input
                  type="text"
                  value={form.heading}
                  onChange={(e) => setForm({ ...form, heading: e.target.value })}
                  maxLength={250}
                  placeholder="e.g. Metro service delayed on Blue Line"
                  className={fieldCls(formErrors.heading)}
                />
                <div className="flex justify-between">
                  {formErrors.heading
                    ? <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.heading}</p>
                    : <span />}
                  <span className="text-[10px] text-slate-400">{form.heading.length}/250</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Destination Link *</label>
                <input
                  type="text"
                  placeholder="https://... or /news/article-slug"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  maxLength={1000}
                  className={fieldCls(formErrors.linkUrl)}
                />
                {formErrors.linkUrl
                  ? <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.linkUrl}</p>
                  : <p className="text-[10px] text-slate-400">Where readers are redirected when they tap the headline.</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Link Text</label>
                <input
                  type="text"
                  placeholder="e.g. Read More"
                  value={form.linkText}
                  onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  maxLength={100}
                  className={fieldCls(false)}
                />
                <p className="text-[10px] text-slate-400">Label shown on the live news action. Defaults to “Read More”.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={fieldCls(formErrors.category)}
                >
                  <option value="">Select a category…</option>
                  {categoryOptions.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}{c.isActive === false ? ' (Inactive)' : ''}
                    </option>
                  ))}
                </select>
                {formErrors.category
                  ? <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.category}</p>
                  : categoryOptions.length === 0
                    ? <p className="text-[10px] text-amber-500">No categories available. Create one in Categories &amp; Sections first.</p>
                    : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Priority</label>
                  <select
                    value={String(form.priority)}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                    className={fieldCls(false)}
                  >
                    {PRIORITIES.map((p) => <option key={p.value} value={String(p.value)}>{p.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Active</label>
                  <select
                    value={form.isActive ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                    className={fieldCls(false)}
                  >
                    <option value="true">Active (shown to readers)</option>
                    <option value="false">Inactive (hidden)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Go-Live Time (optional)</label>
                <input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  className={fieldCls(false)}
                />
                <p className="text-[10px] text-slate-400">
                  Leave empty to go live immediately. A future time schedules the item and hides it from readers until then.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={saving}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Saving...' : modal.mode === 'edit' ? 'Save Changes' : 'Create Live News'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Delete this live news item?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              “{deleting.heading}” will be permanently removed. If you only want to hide it temporarily, set it to Inactive instead.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteBusy}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 disabled:opacity-60"
              >
                {deleteBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Live News
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
