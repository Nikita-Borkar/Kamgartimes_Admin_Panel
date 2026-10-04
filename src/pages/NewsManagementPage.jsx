import React, { useState } from 'react';
import { 
  PlusCircle, Search, Filter, Edit3, Trash2, Eye, Flame, 
  Star, Mic, Volume2, CheckCircle2, AlertCircle, X, Image as ImageIcon, MapPin, Tag, Layers
} from 'lucide-react';
import Pagination from '../components/Pagination';
import ArticleViewModal from '../components/ArticleViewModal';

export default function NewsManagementPage({ 
  articles, 
  categories, 
  reporters,
  onOpenCreatePage,
  onDeleteArticle,
  onToggleStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [viewingArticle, setViewingArticle] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredArticles = articles.filter(art => {
    const matchesSearch = (art.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (art.reporter || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory || art.categoryLabel === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || art.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate paginated slice
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl transition-colors duration-300">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            📰 News Articles & Blogs Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, view, edit, and organize all news articles, hero banners, breaking news, audio podcasts, and live blogs.
          </p>
        </div>

        <button
          onClick={() => onOpenCreatePage(null)}
          className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition duration-200 active:scale-95 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Write New Article</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center transition-colors duration-300">
        
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by news headline or reporter..."
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
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
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
            <option value="All">All Status</option>
            <option value="Published">Published (Live)</option>
            <option value="Pending">Pending Review</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

      </div>

      {/* Articles Table with S.No. & Pagination */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Total Articles: <strong className="text-slate-900 dark:text-white">{filteredArticles.length}</strong></span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">● Live Website Data Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl w-12 text-center">S.No.</th>
                <th className="p-3.5">Thumbnail & Article Headline</th>
                <th className="p-3.5">Category & City</th>
                <th className="p-3.5">Reporter</th>
                <th className="p-3.5">Badges</th>
                <th className="p-3.5">Views</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No articles found matching search criteria.
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((art, idx) => {
                  const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={art.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                      {/* S.No Column */}
                      <td className="p-3.5 font-bold text-slate-400 dark:text-slate-500 text-center">
                        #{serialNo}
                      </td>

                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white max-w-md">
                        <div className="flex items-start gap-3">
                          <img 
                            src={art.image || art.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=400&q=80'} 
                            alt="" 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 group-hover:scale-105 transition cursor-pointer"
                            onClick={() => setViewingArticle(art)}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div>
                            <p 
                              onClick={() => setViewingArticle(art)}
                              className="line-clamp-2 leading-snug font-serif text-xs text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition cursor-pointer"
                            >
                              {art.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {art.isHero && (
                                <span className="text-[9px] font-extrabold bg-red-700 text-white px-1.5 py-0.5 rounded shadow">
                                  HERO
                                </span>
                              )}
                              {art.isBreaking && (
                                <span className="text-[9px] font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded shadow">
                                  BREAKING
                                </span>
                              )}
                              {art.isFeatured && (
                                <span className="text-[9px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                                  FEATURED
                                </span>
                              )}
                              {art.isLiveBlog && (
                                <span className="text-[9px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE BLOG
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">{art.date}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium block w-max">
                            {art.category}
                          </span>
                          {art.city && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-500" /> {art.city}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {art.reporter}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {art.hasAudio && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold" title="Audio Podcast Available">
                              <Volume2 className="w-3 h-3" /> Audio
                            </span>
                          )}
                          {art.isTrending && (
                            <span className="text-[10px] text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold">
                              Trending
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">
                        {art.views ? art.views.toLocaleString() : 0}
                      </td>

                      <td className="p-3.5">
                        <button 
                          onClick={() => onToggleStatus(art.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 ${
                            art.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                            art.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                            'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${art.status === 'Published' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                          {art.status}
                        </button>
                      </td>

                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setViewingArticle(art)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition"
                          title="View Full Article Page"
                        >
                          <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </button>
                        <button
                          onClick={() => onOpenCreatePage(art)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Article in Editor"
                        >
                          <Edit3 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => setDeletingId(art.id)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-red-600 hover:bg-red-500/10 transition"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredArticles.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

      </div>

      {/* Article View Modal */}
      {viewingArticle && (
        <ArticleViewModal
          article={viewingArticle}
          onClose={() => setViewingArticle(null)}
          onEdit={onOpenCreatePage}
          onToggleStatus={onToggleStatus}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Are you sure you want to delete this article?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDeleteArticle(deletingId); setDeletingId(null); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
              >
                Delete Article
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

