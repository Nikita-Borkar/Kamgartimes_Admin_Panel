import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle, Search, Edit3, Trash2, Eye, AlertCircle, Loader2,
  Image as ImageIcon, RefreshCw
} from 'lucide-react';
import Pagination from '../components/Pagination';
import ArticleViewModal from '../components/ArticleViewModal';
import { fetchArticles, deleteArticle, updateArticleStatus } from '../api/articles';
import { hasPermission } from '../utils/permissions';

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=400&q=80';

export default function NewsManagementPage({
  categories,
  user,
  showToast,
  onOpenCreatePage
}) {
  const canCreate = hasPermission(user, 'article:create');
  const canUpdate = hasPermission(user, 'article:update');
  const canPublish = hasPermission(user, 'article:publish');
  const canDelete = hasPermission(user, 'article:delete');
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [viewingArticle, setViewingArticle] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search
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
      const data = await fetchArticles({
        status: selectedStatus || undefined,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      setArticles(data?.articles || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setArticles([]);
      setTotal(0);
      setLoadError(errOf(err));
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedCategory, debouncedSearch, currentPage, itemsPerPage]);

  useEffect(() => { load(); }, [load]);

  // Category helpers (backend: article.category is a populated {_id,name,slug,parent})
  const activeCategories = (categories || []).filter(c => c.isActive !== false);
  const mainCategories = activeCategories.filter(c => !c.parent);
  const sectionsOf = (parentId) => activeCategories.filter(c => c.parent === parentId);
  const catById = (id) => activeCategories.find(c => c._id === id);

  const categoryInfo = (art) => {
    const cat = art.category;
    if (!cat) return { name: '—', section: null };
    if (typeof cat === 'object') {
      const parentId = cat.parent ? (typeof cat.parent === 'object' ? cat.parent._id : cat.parent) : null;
      const parentName = parentId ? catById(parentId)?.name : null;
      return parentName
        ? { name: parentName, section: cat.name }
        : { name: cat.name, section: null };
    }
    const catObj = catById(cat);
    if (!catObj) return { name: '—', section: null };
    if (catObj.parent) {
      const parentName = catById(catObj.parent)?.name;
      return { name: parentName || '—', section: catObj.name };
    }
    return { name: catObj.name, section: null };
  };

  const toViewModal = (art) => {
    const cd = categoryInfo(art);
    return {
      ...art,
      id: art._id,
      image: art.featuredImage,
      reporter: art.author?.name || 'Kamgar Times',
      views: art.stats?.views || 0,
      likes: art.stats?.likes || 0,
      date: fmtDate(art.publishedAt || art.createdAt),
      categoryLabel: [cd.name, cd.section].filter(Boolean).join(' › '),
      category: cd.name
    };
  };

  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  const handleToggleStatus = async (art) => {
    const next = art.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await updateArticleStatus(art._id, next);
      showToast?.(next === 'PUBLISHED' ? 'Article published & live.' : 'Article moved back to draft.', 'success');
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    try {
      await deleteArticle(deleting._id);
      showToast?.('Article deleted.', 'warning');
      setDeleting(null);
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl transition-colors duration-300">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            📰 News Articles &amp; Blogs Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, view, edit and publish news articles with rich text editing, featured images and SEO metadata.
          </p>
        </div>

        {canCreate && <button
          onClick={() => onOpenCreatePage(null)}
          className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition duration-200 active:scale-95 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Write New Article</span>
        </button>}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center transition-colors duration-300">

        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by news headline..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none transition"
          >
            <option value="All">All Categories</option>
            {mainCategories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
            {mainCategories.map(c => (
              sectionsOf(c._id).length > 0 && (
                <optgroup key={`sections-${c._id}`} label={`${c.name} — Sections`}>
                  {sectionsOf(c._id).map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </optgroup>
              )
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none transition"
          >
            <option value="">All Status</option>
            <option value="PUBLISHED">Published (Live)</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

      </div>

      {/* Articles Table with S.No. & Pagination */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Total Articles: <strong className="text-slate-900 dark:text-white">{total}</strong></span>
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
            <span className="text-xs">Loading articles...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl w-12 text-center">S.No.</th>
                  <th className="p-3.5">Thumbnail &amp; Article Headline</th>
                  <th className="p-3.5">Category &amp; Section</th>
                  <th className="p-3.5">Author</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {articles.length === 0 && !loadError ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 dark:text-slate-500">
                      No articles found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  articles.map((art, idx) => {
                    const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
                    const cd = categoryInfo(art);
                    const isPublished = art.status === 'PUBLISHED';
                    return (
                      <tr key={art._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                        {/* S.No Column */}
                        <td className="p-3.5 font-bold text-slate-400 dark:text-slate-500 text-center">
                          #{serialNo}
                        </td>

                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white max-w-md">
                          <div className="flex items-start gap-3">
                            {art.featuredImage ? (
                              <img
                                src={art.featuredImage}
                                alt=""
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 group-hover:scale-105 transition cursor-pointer"
                                onClick={() => setViewingArticle(toViewModal(art))}
                                onError={(e) => { e.target.src = FALLBACK_IMG; }}
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-center cursor-pointer"
                                onClick={() => setViewingArticle(toViewModal(art))}
                              >
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <p
                                onClick={() => setViewingArticle(toViewModal(art))}
                                className="line-clamp-2 leading-snug font-serif text-xs text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition cursor-pointer"
                              >
                                {art.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <span className="text-[10px] text-slate-400">{fmtDate(art.publishedAt || art.createdAt)}</span>
                                {art.slug && (
                                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">/{art.slug}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-1">
                            <span className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium block w-max">
                              {cd.name}
                            </span>
                            {cd.section && (
                              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-medium block w-max">
                                ↳ {cd.section}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                          {art.author?.name || '—'}
                        </td>

                        <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">
                          {(art.stats?.views || 0).toLocaleString()}
                        </td>

                        <td className="p-3.5">
                          {canPublish && <button
                            onClick={() => handleToggleStatus(art)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 ${
                              isPublished
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                            title="Click to toggle publish status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                            {isPublished ? 'Published' : 'Draft'}
                          </button>}
                        </td>

                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setViewingArticle(toViewModal(art))}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition"
                            title="View Full Article Page"
                          >
                            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </button>
                          {canUpdate && <button
                            onClick={() => onOpenCreatePage(art)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Article in Editor"
                          >
                            <Edit3 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          </button>}
                          {canDelete && <button
                            onClick={() => setDeleting(art)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-red-600 hover:bg-red-500/10 transition"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </button>}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
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

      {/* Article View Modal */}
      {viewingArticle && (
        <ArticleViewModal
          article={viewingArticle}
          onClose={() => setViewingArticle(null)}
          onEdit={(art) => { setViewingArticle(null); onOpenCreatePage(art); }}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Are you sure you want to delete this article?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              “{deleting.title}” — this action cannot be undone.
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
                Delete Article
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
