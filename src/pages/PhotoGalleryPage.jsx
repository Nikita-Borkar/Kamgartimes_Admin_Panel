import React, { useState } from 'react';
import { Camera, PlusCircle, Trash2, Eye, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export default function PhotoGalleryPage({ photoGalleries, onAddGallery, onDeleteGallery }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('कामगार कार्यक्रम');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddGallery({
      id: Date.now(),
      title: title.trim(),
      category: category,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      coverImage: coverImage,
      photoCount: 6,
      photos: [
        { url: coverImage, caption: title.trim() }
      ]
    });

    setTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex items-center justify-between transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-indigo-500" />
            Photo Gallery Albums Manager (फोटो गैलरी एल्बम)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage picture gallery albums displayed in the Photo Gallery section of the website.
          </p>
        </div>

        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
          {photoGalleries.length} Active Albums
        </span>
      </div>

      {/* Add Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-500" /> Create New Photo Gallery Album
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Album Title (Hindi / English)*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. नागपुर कामगार महारैली एवं पुरस्कार वितरण"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none font-serif"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cover Image URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Album</span>
            </button>
          </div>

        </form>
      </div>

      {/* Album Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photoGalleries.map(gal => (
          <div key={gal.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg space-y-3 p-3 hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950">
              <img src={gal.coverImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> {gal.photoCount} Photos
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white font-serif line-clamp-2 leading-snug">{gal.title}</h4>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                <span>{gal.date}</span>
                <button
                  onClick={() => onDeleteGallery(gal.id)}
                  className="text-red-600 dark:text-red-400 hover:underline font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
