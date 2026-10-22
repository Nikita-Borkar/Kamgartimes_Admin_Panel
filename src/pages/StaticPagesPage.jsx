import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  FileSignature, PlusCircle, Edit3, Trash2, X, AlertCircle, Loader2,
  CheckCircle2, RotateCcw, Search, ArrowLeft, Eye, EyeOff, Globe,
  LayoutPanelTop, SearchCheck, Save, FileText, Info
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { hasPermission } from '../utils/permissions';
import {
  fetchStaticPages, createStaticPage, updateStaticPage, deleteStaticPage
} from '../api/staticPages';

/* --------------------------- rich text config ----------------------------- */

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '1' }],
    ['blockquote', 'code-block'],
    ['link'],
    [{ color: [] }, { background: [] }],
    ['clean']
  ]
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent', 'blockquote', 'code-block',
  'link', 'color', 'background'
];

/* --------------------------- helpers -------------------------------------- */

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
};

const slugify = (text) =>
  text.trim().toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const EMPTY_FORM = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  isActive: true,
  showInFooter: true,
  showInHeader: false,
  sortOrder: '0',
  metaTitle: '',
  metaDescription: ''
};

// Quick-start stubs for the six standard reader-site pages
const STANDARD_PAGES = [
  { title: 'About Us', slug: 'about-us' },
  { title: 'Contact Us', slug: 'contact-us' },
  { title: 'Disclaimer', slug: 'disclaimer' },
  { title: 'Privacy Policy', slug: 'privacy-policy' },
  { title: 'Donate Us', slug: 'donate-us' },
  { title: 'Pay for Ads', slug: 'pay-for-ads' }
];

export default function StaticPagesPage({ user, showToast }) {
  const canCreate = hasPermission(user, 'staticPage:create');
  const canUpdate = hasPermission(user, 'staticPage:update');
  const canDelete = hasPermission(user, 'staticPage:delete');

  /* -------------------------------- list state ------------------------------- */
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  /* ------------------------------- editor state ------------------------------ */
  const [editing, setEditing] = useState(null); // null | 'create' | page object
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  /* ------------------------------ delete state ------------------------------- */
  const [confirming, setConfirming] = useState(null); // page object (soft delete)
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = async (p = page, l = limit, s = search) => {
    setLoading(true);
    try {
      const data = await fetchStaticPages({ page: p, limit: l, search: s || undefined });
      setPages(data?.pages || []);
      setTotal(data?.total || 0);
    } catch {
      setPages([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, limit, ''); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await load(page, limit); } finally { setRefreshing(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const s = searchInput.trim();
    setSearch(s);
    setPage(1);
    load(1, limit, s);
  };

  /* --------------------------------- editor ---------------------------------- */
  const openCreate = (preset = null) => {
    setForm({ ...EMPTY_FORM, ...(preset || {}) });
    setSlugTouched(!!preset?.slug);
    setFormError('');
    setEditing('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (pg) => {
    setForm({
      title: pg.title || '',
      slug: pg.slug || '',
      content: typeof pg.content === 'string' ? pg.content : JSON.stringify(pg.content ?? '', null, 2),
      excerpt: pg.excerpt || '',
      isActive: pg.isActive !== false,
      showInFooter: !!pg.showInFooter,
      showInHeader: !!pg.showInHeader,
      sortOrder: String(pg.sortOrder ?? 0),
      metaTitle: pg.seo?.metaTitle || '',
      metaDescription: pg.seo?.metaDescription || ''
    });
    setSlugTouched(false);
    setFormError('');
    setEditing(pg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeEditor = () => {
    setEditing(null);
    setFormError('');
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.title.trim()) {
      setFormError('Page title is required.');
      return;
    }
    if (!form.content || !form.content.trim() || form.content === '<p><br></p>') {
      setFormError('Page content is required — write something in the editor.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      content: form.content,
      excerpt: form.excerpt.trim(),
      isActive: form.isActive,
      showInFooter: form.showInFooter,
      showInHeader: form.showInHeader,
      sortOrder: Number(form.sortOrder) || 0,
      seo: {
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim()
      }
    };
    // slug only when the editor touched it (on create, blank = derive from title)
    if (slugTouched && form.slug.trim()) payload.slug = form.slug.trim();

    setSaving(true);
    try {
      if (editing === 'create') {
        const created = await createStaticPage(payload);
        showToast(`Page "${created?.title || payload.title}" created!`, 'success');
      } else {
        await updateStaticPage(editing._id, payload);
        showToast(`Page "${payload.title}" updated successfully!`, 'success');
      }
      closeEditor();
      await load(page, limit);
    } catch (err) {
      setFormError(errOf(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteStaticPage(confirming._id);
      showToast(`"${confirming.title}" unpublished (soft-deleted).`, 'warning');
      setConfirming(null);
      await load(page, limit);
    } catch (err) {
      setDeleteError(errOf(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (pg) => {
    try {
      await updateStaticPage(pg._id, { isActive: true });
      showToast(`"${pg.title}" published again.`, 'success');
      await load(page, limit);
    } catch (err) {
      showToast(errOf(err), 'error');
    }
  };

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  /* ------------------------------- editor view ------------------------------- */
  if (editing) {
    const inputCls = 'w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none';
    return (
      <div className="space-y-6">

        {/* Editor header */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={closeEditor}
              className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              title="Back to page list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-amber-500" />
                {editing === 'create' ? 'Create Static Page' : `Editing: ${editing.title}`}
              </h2>
              <p className="text-[11px] text-slate-400">
                Route on the reader site: <span className="font-mono text-amber-400">/static-pages/{form.slug || (slugTouched ? form.slug : slugify(form.title) || '…')}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={closeEditor}
              className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editing === 'create' ? 'Create Page' : 'Save Changes'}
            </button>
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{formError}</span>
          </div>
        )}

        {/* Quick-start chips for new pages */}
        {editing === 'create' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mr-1">
              <Info className="w-3.5 h-3.5 text-amber-500" /> Start from a standard page:
            </span>
            {STANDARD_PAGES.map(p => (
              <button
                key={p.slug}
                onClick={() => { setForm(f => ({ ...f, title: p.title, slug: p.slug })); setSlugTouched(true); }}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-red-500/50 transition"
              >
                {p.title}
              </button>
            ))}
            {form.title && (
              <button
                onClick={() => { setForm(f => ({ ...f, title: '', slug: '' })); setSlugTouched(false); }}
                className="px-3 py-1.5 rounded-full text-[11px] text-slate-500 hover:text-red-400 transition"
              >
                clear
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ------------------------- main column ------------------------- */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Page Title*</label>
                  <input
                    type="text" maxLength={200} value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    placeholder="e.g. About Us"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Slug (URL)</label>
                  <input
                    type="text" maxLength={100} value={form.slug}
                    onChange={(e) => { setSlugTouched(true); setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }}
                    placeholder="auto from title"
                    className={`${inputCls} font-mono`}
                  />
                  <p className="text-[10px] text-slate-500">
                    Blank = generated from title. NB: changing the title later regenerates the slug unless you set it here.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" /> Page Content*
                </label>
                <div className="bg-white rounded-xl overflow-hidden [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-slate-700 [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-slate-700 [&_.ql-editor]:min-h-[320px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-slate-800">
                  <ReactQuill
                    theme="snow"
                    value={form.content}
                    onChange={(v) => setField('content', v)}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Write the page content here — headings, lists, links, bold/italic..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-500" /> Excerpt (short summary)
                </label>
                <textarea
                  rows={2} maxLength={500} value={form.excerpt}
                  onChange={(e) => setField('excerpt', e.target.value)}
                  placeholder="One or two line summary used in search results / link previews..."
                  className={`${inputCls} leading-snug`}
                />
                <p className="text-[10px] text-slate-500">{form.excerpt.length}/500</p>
              </div>
            </div>
          </div>

          {/* --------------------------- side column --------------------------- */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" /> Publishing
              </h3>

              {[
                { key: 'isActive', label: 'Published (live on site)', icon: form.isActive ? Eye : EyeOff, on: form.isActive, hint: 'Unpublished pages stay in this list but return 404 publicly.' },
                { key: 'showInFooter', label: 'Show in footer menu', icon: Globe, on: form.showInFooter, hint: 'Reader site footer link list.' },
                { key: 'showInHeader', label: 'Show in header menu', icon: LayoutPanelTop, on: form.showInHeader, hint: 'Reader site top navigation.' }
              ].map(row => {
                const Icon = row.icon;
                return (
                  <label key={row.key} className="flex items-start justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer">
                    <span className="min-w-0">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${row.on ? 'text-emerald-400' : 'text-slate-500'}`} />
                        {row.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{row.hint}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={form[row.key]}
                      onChange={(e) => setField(row.key, e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                    />
                  </label>
                );
              })}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Sort Order</label>
                <input
                  type="number" value={form.sortOrder}
                  onChange={(e) => setField('sortOrder', e.target.value)}
                  className={inputCls}
                />
                <p className="text-[10px] text-slate-500">Lower numbers appear first in menu lists.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <SearchCheck className="w-4 h-4 text-blue-400" /> SEO
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Meta Title</label>
                <input
                  type="text" maxLength={250} value={form.metaTitle}
                  onChange={(e) => setField('metaTitle', e.target.value)}
                  placeholder="Shown in search engine results"
                  className={inputCls}
                />
                <p className="text-[10px] text-slate-500">{form.metaTitle.length}/250</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Meta Description</label>
                <textarea
                  rows={3} maxLength={300} value={form.metaDescription}
                  onChange={(e) => setField('metaDescription', e.target.value)}
                  placeholder="Short description for search results..."
                  className={`${inputCls} leading-snug`}
                />
                <p className="text-[10px] text-slate-500">{form.metaDescription.length}/300</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------- list view --------------------------------- */
  return (
    <div className="space-y-6">

      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-amber-500" />
            Static Pages Manager
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            About Us, Contact Us, Disclaimer, Privacy Policy, Donate Us, Pay for Ads — edit content with the rich text editor, control footer/header menus and SEO.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            {total} Page{total === 1 ? '' : 's'}
          </span>
          <button
            onClick={handleRefresh} disabled={refreshing}
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition disabled:opacity-50"
            title="Refresh list"
          >
            <Loader2 className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {canCreate && (
            <button
              onClick={() => openCreate()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white shadow-lg flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" /> New Page
            </button>
          )}
        </div>
      </div>

      {/* Search + table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text" value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title or slug..."
            className="bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none w-64"
          />
          <button type="submit" className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/60 transition" title="Search">
            <Search className="w-3.5 h-3.5" />
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); load(1, limit, ''); }}
              className="text-[11px] text-slate-500 hover:text-red-400 transition"
            >
              clear
            </button>
          )}
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading static pages...
          </div>
        ) : pages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl space-y-2">
            <p>{search ? `No pages match "${search}".` : 'No static pages yet.'}</p>
            {!search && (
              <code className="text-[11px] text-amber-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 block w-fit mx-auto">
                node src/scripts/seedStaticPages.js
              </code>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Page</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Menus</th>
                  <th className="p-3">Order</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Updated</th>
                  <th className="p-3 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {pages.map(pg => (
                  <tr key={pg._id} className={`hover:bg-slate-800/30 transition ${pg.isActive ? '' : 'opacity-60'}`}>
                    <td className="p-3">
                      <div className="font-bold text-white max-w-[260px] truncate" title={pg.title}>{pg.title}</div>
                      {pg.excerpt && <div className="text-[10px] text-slate-500 max-w-[260px] truncate" title={pg.excerpt}>{pg.excerpt}</div>}
                    </td>
                    <td className="p-3 font-mono text-amber-400/90">/{pg.slug}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {pg.showInFooter && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">Footer</span>
                        )}
                        {pg.showInHeader && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">Header</span>
                        )}
                        {!pg.showInFooter && !pg.showInHeader && (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-slate-400">{pg.sortOrder}</td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        pg.isActive
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                          : 'text-slate-400 bg-slate-800/80 border-slate-700'
                      }`}>
                        {pg.isActive ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">
                      {fmtDate(pg.updatedAt)}
                      {pg.updatedBy?.name && <span className="block text-[10px] text-slate-600">by {pg.updatedBy.name}</span>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        {!pg.isActive && (
                          <button
                            onClick={() => canUpdate && handleRestore(pg)}
                            disabled={!canUpdate}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition disabled:opacity-40"
                            title={canUpdate ? 'Publish (restore)' : 'Requires staticPage:update permission'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => (canUpdate ? openEdit(pg) : null)}
                          disabled={!canUpdate}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition disabled:opacity-40"
                          title={canUpdate ? 'Edit page content' : 'Requires staticPage:update permission'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => canDelete && setConfirming(pg)}
                          disabled={!canDelete || !pg.isActive}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
                          title={canDelete ? 'Unpublish (soft delete)' : 'Requires staticPage:delete permission'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={Math.max(Math.ceil(total / limit), 1)}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={(p) => { setPage(p); load(p, limit); }}
          onItemsPerPageChange={(n) => { setLimit(n); setPage(1); load(1, n); }}
        />
      </div>

      {/* ============================ SOFT DELETE MODAL ============================ */}
      {confirming && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" /> Unpublish Page
              </h4>
              <button onClick={() => { setConfirming(null); setDeleteError(''); }} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            {deleteError ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" /><span>{deleteError}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                Unpublish <span className="font-bold text-white">{confirming.title}</span>? The page stays in this list as a draft and its public URL returns 404 until you restore it.
              </p>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => { setConfirming(null); setDeleteError(''); }} className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition">
                Cancel
              </button>
              <button
                onClick={handleSoftDelete} disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Unpublish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
