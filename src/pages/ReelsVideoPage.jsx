import React, { useState } from 'react';
import { Video, PlusCircle, Play, Eye, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function ReelsVideoPage() {
  const [reels, setReels] = useState([
    {
      id: 1,
      title: "श्रम मंत्री का बड़ा ऐलान: असंगठित कामगारों के लिए पेंशन योजना",
      views: "45.8K",
      duration: "0:45",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      title: "रेलवे वर्कशॉप हड़ताल वापस: जानिए 12 मुख्य मांगें",
      views: "28.4K",
      duration: "0:58",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80"
    }
  ]);

  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setReels([
      {
        id: Date.now(),
        title: title.trim(),
        views: "1.2K",
        duration: "0:30",
        videoUrl: youtubeUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80"
      },
      ...reels
    ]);

    setTitle('');
    setYoutubeUrl('');
  };

  const handleDelete = (id) => {
    setReels(reels.filter(r => r.id !== id));
  };

  const totalPages = Math.ceil(reels.length / itemsPerPage) || 1;
  const paginatedReels = reels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex items-center justify-between transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-red-500" />
            Short Videos & News Reels Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage vertical video reels and short YouTube clips for social apps.
          </p>
        </div>
      </div>

      {/* Add Reel Form (TEXTAREA FOR REEL TITLE) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-500" /> Add New Video Reel
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-6 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Video Reel Title (Hindi / English)*</label>
            <textarea
              rows="2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. श्रम मंत्री का बड़ा ऐलान: असंगठित कामगारों के लिए पेंशन योजना..."
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none leading-snug font-serif"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">YouTube / Shorts Link</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/shorts/..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Reel</span>
            </button>
          </div>

        </form>
      </div>

      {/* Reels Grid with S.No. & Pagination */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {paginatedReels.map((reel, idx) => {
            const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
              <div key={reel.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg space-y-3 p-3 hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="relative h-64 rounded-xl overflow-hidden bg-slate-950">
                  <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    #{serialNo}
                  </span>
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {reel.duration}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white font-serif line-clamp-2 leading-snug">{reel.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <Eye className="w-3.5 h-3.5" /> {reel.views} Views
                    </span>
                    <button
                      onClick={() => handleDelete(reel.id)}
                      className="text-red-600 dark:text-red-400 hover:underline font-semibold"
                    >
                      Delete
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
          totalItems={reels.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

    </div>
  );
}
