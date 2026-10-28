import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, PlusCircle, Trash2, Image as ImageIcon, 
  Upload, Link as LinkIcon, Loader2, CheckCircle2, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { uploadImage } from '../api/media';
import { fetchGalleryItems, createGalleryItem, deleteGalleryItem } from '../api/gallery';

export default function PhotoGalleryPage({ showToast }) {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  
  // Image source mode: 'upload' (Device se) or 'url' (Link se)
  const [sourceMode, setSourceMode] = useState('upload');
  
  // URL mode state
  const [urlInput, setUrlInput] = useState('');
  
  // Device upload mode state
  const [uploadFile, setUploadFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [uploadedCloudinaryUrl, setUploadedCloudinaryUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  const fileInputRef = useRef(null);

  // Load real gallery items from backend API
  const loadGalleries = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const items = await fetchGalleryItems({ all: true });
      setGalleries(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load gallery items:', err);
      setLoadError(err?.message || 'Failed to load gallery from server.');
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGalleries();
  }, [loadGalleries]);

  // Handle file selection and automatically upload to Cloudinary
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const err = 'Please select a valid image file (JPG, PNG, WEBP).';
      setUploadError(err);
      showToast?.(err, 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      const err = 'Image size should be less than 10 MB.';
      setUploadError(err);
      showToast?.(err, 'error');
      return;
    }

    setUploadError('');
    setUploadFile(file);
    const localBlob = URL.createObjectURL(file);
    setFilePreview(localBlob);
    setIsUploading(true);

    try {
      const result = await uploadImage(file, {
        title: title.trim() || file.name.replace(/\.[^.]+$/, ''),
        status: 'PUBLISHED'
      });

      const finalUrl = result?.url || result?.data?.url || '';
      if (!finalUrl) {
        throw new Error('Image uploaded but URL was not returned by server.');
      }

      setUploadedCloudinaryUrl(finalUrl);
      showToast?.('Image uploaded to Cloudinary successfully!', 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      const errMsg = err?.message || 'Failed to upload image. Please try again.';
      setUploadError(errMsg);
      showToast?.(errMsg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearUpload = () => {
    setUploadFile(null);
    setFilePreview('');
    setUploadedCloudinaryUrl('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalCover = '';
    if (sourceMode === 'upload') {
      if (isUploading) {
        showToast?.('Please wait until image upload finishes.', 'warning');
        return;
      }
      if (!uploadedCloudinaryUrl) {
        const err = 'Please select and upload an image from your device.';
        setUploadError(err);
        showToast?.(err, 'error');
        return;
      }
      finalCover = uploadedCloudinaryUrl;
    } else {
      if (!urlInput.trim()) {
        showToast?.('Please enter a valid image URL.', 'error');
        return;
      }
      finalCover = urlInput.trim();
    }

    setCreating(true);
    try {
      await createGalleryItem({
        title: title.trim(),
        caption: caption.trim(),
        mediaUrl: finalCover,
        thumbnailUrl: finalCover,
        mediaType: 'image',
        sourceType: sourceMode === 'upload' ? 'upload' : 'url',
        isPublished: true,
        showOnHome: false
      });

      showToast?.('Photo album saved to database successfully!', 'success');

      // Reset form
      setTitle('');
      setCaption('');
      setUrlInput('');
      handleClearUpload();

      // Refresh real data from DB
      await loadGalleries();
    } catch (err) {
      console.error('Failed to create gallery item:', err);
      showToast?.(err?.message || 'Failed to create album. Please try again.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo album?')) return;
    setDeletingId(id);
    try {
      await deleteGalleryItem(id);
      showToast?.('Photo album removed from database.', 'warning');
      await loadGalleries();
    } catch (err) {
      console.error('Failed to delete gallery item:', err);
      showToast?.(err?.message || 'Failed to delete album.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex items-center justify-between transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-indigo-500" />
            Photo Gallery Albums Manager (फोटो गैलरी एल्बम)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Connected to Live Database API & Cloudinary Storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadGalleries}
            disabled={loading}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh from database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
            {galleries.length} Live Albums in DB
          </span>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-500" /> Create New Photo Gallery Album
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Title */}
            <div className="sm:col-span-8 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Album Title (शीर्षक)*</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. नागपुर कामगार महारैली एवं पुरस्कार वितरण"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none font-serif"
              />
            </div>

            {/* Caption */}
            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Caption / Description</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Short caption or event description"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Cover Image Source Mode Selector */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cover Image Source*</label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    sourceMode === 'upload'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    sourceMode === 'url'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Paste Image URL</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Upload from Device */}
            {sourceMode === 'upload' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                {!filePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/50 transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to choose photo from device (कंप्यूटर / मोबाइल से फोटो चुनें)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        PNG, JPG, WEBP up to 10 MB. Automatically uploaded to Cloudinary.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                    <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {uploadFile?.name || 'Selected image'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB` : ''}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        {isUploading ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Cloudinary...
                          </span>
                        ) : uploadedCloudinaryUrl ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded to Cloudinary
                          </span>
                        ) : uploadError ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
                            <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleClearUpload}
                        disabled={isUploading}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Paste Image URL */}
            {sourceMode === 'url' && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-9 space-y-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or any image link"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Paste any public image URL from web or CDN.
                  </p>
                </div>

                <div className="sm:col-span-3 flex justify-center">
                  {urlInput ? (
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <img
                        src={urlInput}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 text-[10px]">
                      Preview
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploading || creating}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Image...</span>
                </>
              ) : creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Album to DB...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Album</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Album Cards from Live Database */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Saved Albums in Database ({galleries.length})
          </h3>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading albums from database...</p>
          </div>
        ) : loadError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 text-center text-red-400 text-xs">
            {loadError}
          </div>
        ) : galleries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Photo Albums Found (कोई एल्बम नहीं है)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Abhi database mein koi photo album nahi hai. Naya photo album add karne ke liye upar form use karein!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleries.map(gal => (
              <div key={gal._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg space-y-3 p-3 hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950">
                  <img 
                    src={gal.thumbnailUrl || gal.mediaUrl} 
                    alt={gal.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Live
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white font-serif line-clamp-2 leading-snug">{gal.title}</h4>
                  {gal.caption && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{gal.caption}</p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{new Date(gal.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <button
                      onClick={() => handleDelete(gal._id)}
                      disabled={deletingId === gal._id}
                      className="text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      {deletingId === gal._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
