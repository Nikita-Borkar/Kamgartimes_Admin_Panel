import React, { useState } from 'react';
import { Youtube, PlusCircle, Play, Eye, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function YouTubeVideosPage() {
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: "Exclusive Interview with Union Minister | Kamgar Times",
      views: "125.4K",
      duration: "15:45",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80",
      isFeatured: true
    },
    {
      id: 2,
      title: "Nagpur Metro Phase 2 Updates and City Development",
      views: "89.2K",
      duration: "08:20",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1546422904-90eab23c3d7e?auto=format&fit=crop&w=800&q=80",
      isFeatured: false
    }
  ]);

  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setVideos([
      {
        id: Date.now(),
        title: title.trim(),
        views: "0",
        duration: "00:00",
        videoUrl: youtubeUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
        isFeatured
      },
      ...videos
    ]);

    setTitle('');
    setYoutubeUrl('');
    setIsFeatured(false);
  };

  const handleDelete = (id) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  const totalPages = Math.ceil(videos.length / itemsPerPage) || 1;
  const paginatedVideos = videos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex items-center justify-between transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-600" />
            YouTube Full Videos Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage horizontal full-length YouTube videos for the homepage sliders.
          </p>
        </div>
      </div>

      {/* Add Video Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-red-500" /> Add New YouTube Video
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Video Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">YouTube Embed URL</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/embed/..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>
          
          <div className="sm:col-span-1 pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded border-slate-300"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Featured</span>
            </label>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Video</span>
            </button>
          </div>

        </form>
      </div>

      {/* Videos Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paginatedVideos.map((video, idx) => {
            const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
              <div key={video.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg flex flex-col sm:flex-row p-3 gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="relative h-32 sm:w-48 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                  <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    #{serialNo}
                  </span>
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {video.duration}
                  </span>
                </div>

                <div className="flex flex-col justify-center flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{video.title}</h4>
                    {video.isFeatured && (
                      <span className="text-[9px] bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 font-bold px-2 py-0.5 rounded border border-red-500/30">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                      <Eye className="w-4 h-4" /> {video.views} Views
                    </span>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={videos.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

    </div>
  );
}
