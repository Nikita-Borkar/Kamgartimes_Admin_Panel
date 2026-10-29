import React, { useState, useEffect, useCallback } from 'react';
import {
  Video, PlusCircle, Search, Play, Trash2, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import Pagination from '../components/Pagination';
import VideoPlayerModal from '../components/VideoPlayerModal';
import VideoFormModal from '../components/VideoFormModal';
import { fetchVideos, deleteVideo, updateVideo } from '../api/videos';

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
};

export default function ReelsVideoPage({ categories, user, showToast }) {
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedVideoType, setSelectedVideoType] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [formModal, setFormModal] = useState(null);
  const [playerVideo, setPlayerVideo] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

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
      const data = await fetchVideos({
        videoType: selectedVideoType || undefined,
        status: selectedStatus || undefined,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      setVideos(data?.videos || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setVideos([]);
      setTotal(0);
      setLoadError(errOf(err));
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedCategory, selectedVideoType, debouncedSearch, currentPage, itemsPerPage]);

  useEffect(() => { load(); }, [load]);

  const activeCategories = (categories || []).filter(c => c.isActive !== false);
  const mainCategories = activeCategories.filter(c => !c.parent);
  const sectionsOf = (parentId) => activeCategories.filter(c => c.parent === parentId);

  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  const handleToggleStatus = async (video) => {
    try {
      await updateVideo(video._id, { status: video.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
      showToast?.(video.status === 'PUBLISHED' ? 'Video moved back to draft.' : 'Video published & live.', 'success');
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    try {
      await deleteVideo(deleting._id);
      showToast?.('Video removed.', 'warning');
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
            <Video className="w-6 h-6 text-red-500" /> Reels &amp; Videos Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage YouTube Shorts, reels, and full-length videos together. Choose the format when adding a video.
          </p>
        </div>

        <button
          onClick={() => setFormModal({ video: null })}
          className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition duration-200 active:scale-95 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Add Video</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center transition-colors duration-300">
        <div className="sm:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by video title..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition"
          />
        </div>
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
        <div className="sm:col-span-2">
          <select
            value={selectedVideoType}
            onChange={(e) => { setSelectedVideoType(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none transition"
            aria-label="Filter by video format"
          >
            <option value="">All Formats</option>
            <option value="SHORT">Reels &amp; Shorts</option>
            <option value="VIDEO">Full Videos</option>
          </select>
        </div>
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

      {/* Reels & Videos Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Total videos: <strong className="text-slate-900 dark:text-white">{total}</strong></span>
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
            <span className="text-xs">Loading shorts...</span>
          </div>
        ) : videos.length === 0 && !loadError ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No videos found for these filters. Add a reel, Short, or full video to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {videos.map((video, idx) => (
              <div
                key={video._id}
                className={`bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col ${video.videoType === 'VIDEO' ? 'col-span-2' : ''}`}
              >
                {/* Format-aware thumbnail + play */}
                <div
                  className={`relative ${video.videoType === 'SHORT' ? 'aspect-[9/16]' : 'aspect-video'} bg-slate-200 dark:bg-slate-900 group cursor-pointer`}
                  onClick={() => setPlayerVideo(video)}
                >
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Video className="w-6 h-6 text-slate-400" /></div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 bg-slate-950/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    #{(currentPage - 1) * itemsPerPage + idx + 1}
                  </span>
                  <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {video.videoType === 'SHORT' ? 'REEL / SHORT' : 'FULL VIDEO'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleting(video); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/70 text-white hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                    title="Remove video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Meta */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <p
                    onClick={() => setPlayerVideo(video)}
                    className="text-xs font-bold text-slate-900 dark:text-white font-serif line-clamp-2 leading-snug cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition"
                  >
                    {video.title}
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {video.category && (
                        <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-medium px-1.5 py-0.5 rounded truncate max-w-full">
                          {typeof video.category === 'object' ? video.category.name : 'Category'}
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleStatus(video)}
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold transition flex items-center gap-1 ${
                          video.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                        title="Click to toggle publish status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${video.status === 'PUBLISHED' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                        {video.status === 'PUBLISHED' ? 'Live' : 'Draft'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{fmtDate(video.createdAt)}</span>
                      <button
                        onClick={() => setFormModal({ video })}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
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

      {/* Player Modal */}
      {playerVideo && (
        <VideoPlayerModal video={playerVideo} onClose={() => setPlayerVideo(null)} />
      )}

      {/* Create / Edit Modal */}
      {formModal && (
        <VideoFormModal
          video={formModal.video}
          videoType={selectedVideoType || 'VIDEO'}
          categories={categories}
          onClose={() => setFormModal(null)}
          onSaved={() => { setFormModal(null); load(); }}
          showToast={showToast}
        />
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Remove this video?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              “{deleting.title}” — only the record is removed; the video stays on YouTube.
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
                Remove Short
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
