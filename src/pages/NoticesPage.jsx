import React, { useState, useEffect, useCallback } from 'react';
import {
  BellRing, Plus, Search, Trash2, Edit3, AlertCircle, Loader2, RefreshCw,
  CheckCircle2, X, Link as LinkIcon, CalendarClock, ExternalLink
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { fetchNotices, createNotice, updateNotice, deleteNotice } from '../api/notices';

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

const fmtDateTime = (d) => {
  if (!d) return null;
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch { return null; }
};

const toLocalInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const EMPTY_FORM = {
  message: '', linkUrl: '', isActive: true, startsAt: '', endsAt: ''
};

export default function NoticesPage({ user, showToast }) {
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', notice }
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
  }, [searchTerm]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchNotices({
        isActive: activeFilter || undefined,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      setNotices(data?.notices || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setNotices([]);
      setTotal(0);
      setLoadError(errOf(err));
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch, currentPage, itemsPerPage]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModal({ mode: 'create' });
  };

  const openEdit = (notice) => {
    setForm({
      message: notice.message || '',
      linkUrl: notice.linkUrl || '',
      isActive: notice.isActive !== false,
      startsAt: toLocalInput(notice.startsAt),
      endsAt: toLocalInput(notice.endsAt)
    });
    setFormErrors({});
    setModal({ mode: 'edit', notice });
  };

  const validate = () => {
    const next = {};
    if (!form.message.trim()) next.message = 'Message is required.';
    else if (form.message.trim().length > 1000) next.message = 'Message must be 1000 characters or fewer.';
    if (form.linkUrl.trim()) {
      try { new URL(form.linkUrl.trim()); } catch { next.linkUrl = 'Link must be a valid URL (https://...).'; }
    }
    if (form.startsAt && form.endsAt && new Date(form.startsAt) >= new Date(form.endsAt)) {
      next.endsAt = 'End must be after start.';
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (saving || !validate()) return;
    setSaving(true);
    const body = {
      message: form.message.trim(),
      linkUrl: form.linkUrl.trim() || '',
      isActive: form.isActive,
      startsAt: form.startsAt || '',
      endsAt: form.endsAt || ''
    };
    try {
      if (modal?.mode === 'edit') {
        await updateNotice(modal.notice._id, body);
        showToast?.('Notice updated.', 'success');
      } else {
        await createNotice(body);
        showToast?.('Notice created.', 'success');
      }
      setModal(null);
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (notice) => {
    if (togglingId) return;
    setTogglingId(notice._id);
    try {
      await updateNotice(notice._id, {
        message: notice.message,
        linkUrl: notice.linkUrl || '',
        isActive: !notice.isActive,
        startsAt: notice.startsAt || '',
        endsAt: notice.endsAt || ''
      });
      showToast?.(notice.isActive ? 'Notice deactivated.' : 'Notice activated.', 'success');
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
      await deleteNotice(deleting._id);
      showToast?.('Notice deleted.', 'warning');
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
            <BellRing className="w-6 h-6 text-red-500" /> Notices
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish ticker notices across the site with active status and an optional schedule window.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition duration-200 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>New Notice</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center transition-colors duration-300">
        <div className="sm:col-span-9 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by message..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none transition"
          >
            <option value="">All Notices</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Total Notices: <strong className="text-slate-900 dark:text-white">{total}</strong></span>
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
            <span className="text-xs">Loading notices...</span>
          </div>
        ) : notices.length === 0 && !loadError ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <BellRing className="w-8 h-8" />
            <span>No notices found. Create your first notice to alert readers.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center gap-3"
              >
                {/* Status toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(notice)}
                    disabled={togglingId === notice._id}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition disabled:opacity-50 ${
                      notice.isActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                    title="Click to toggle active status"
                  >
                    {togglingId === notice._id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <span className={`w-2 h-2 rounded-full ${notice.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />}
                    {notice.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{notice.message}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-slate-400">
                    {(notice.startsAt || notice.endsAt) && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" />
                        {fmtDateTime(notice.startsAt) || 'now'} → {fmtDateTime(notice.endsAt) || 'no end'}
                      </span>
                    )}
                    {notice.linkUrl && (
                      <a href={notice.linkUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                        <LinkIcon className="w-3 h-3" /> {notice.linkUrl} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {notice.createdBy?.name && <span>by {notice.createdBy.name}</span>}
                    <span>{fmtDateTime(notice.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(notice)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    onClick={() => setDeleting(notice)}
                    className="text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-600" />
                {modal.mode === 'edit' ? 'Edit Notice' : 'New Notice'}
              </h3>
              <button onClick={() => !saving && setModal(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Notice Message *</label>
                <textarea
                  rows="4"
                  placeholder="Enter notice text for ticker..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1000}
                  className={fieldCls(formErrors.message)}
                />
                <div className="flex justify-between">
                  {formErrors.message
                    ? <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.message}</p>
                    : <span />}
                  <span className="text-[10px] text-slate-400">{form.message.length}/1000</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Link URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  maxLength={500}
                  className={fieldCls(formErrors.linkUrl)}
                />
                {formErrors.linkUrl && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.linkUrl}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Active Status</label>
                <select
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  className={fieldCls(false)}
                >
                  <option value="true">Active (shown in ticker)</option>
                  <option value="false">Inactive (hidden)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Starts At (optional)</label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className={fieldCls(formErrors.endsAt)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Ends At (optional)</label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className={fieldCls(formErrors.endsAt)}
                  />
                </div>
              </div>
              {formErrors.endsAt && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.endsAt}</p>}
              <p className="text-[10px] text-slate-400">
                Leave the schedule empty for a notice that runs continuously while Active.
              </p>
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
                {saving ? 'Saving...' : modal.mode === 'edit' ? 'Save Changes' : 'Create Notice'}
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
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Delete this notice?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {deleting.message ? `“${deleting.message.slice(0, 80)}${deleting.message.length > 80 ? '...' : ''}”` : 'This notice'} will be permanently removed.
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
                Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
