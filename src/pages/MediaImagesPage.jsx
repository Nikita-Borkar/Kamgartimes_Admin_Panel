import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Images, Upload, Search, Trash2, Edit3, AlertCircle, Loader2, RefreshCw,
  CheckCircle2, X, Image as ImageIcon, HardDrive, Maximize2
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { fetchImages, uploadImage, updateImage, deleteImage } from '../api/media';

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
};

const fmtBytes = (b) => {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MediaImagesPage({ user, showToast }) {
  const [images, setImages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Upload modal
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', altText: '', status: 'DRAFT' });
  const [uploadFile, setUploadFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});
  const fileInputRef = useRef(null);

  // Edit metadata modal (only title/description/altText/status are mutable)
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', altText: '', status: 'DRAFT' });
  const [editSaving, setEditSaving] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Lightbox
  const [lightbox, setLightbox] = useState(null);

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
      const data = await fetchImages({
        status: selectedStatus || undefined,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      setImages(data?.images || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setImages([]);
      setTotal(0);
      setLoadError(errOf(err));
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, debouncedSearch, currentPage, itemsPerPage]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  // ---- upload ----
  const openUpload = () => {
    setUploadForm({ title: '', description: '', altText: '', status: 'DRAFT' });
    setUploadFile(null);
    setFilePreview('');
    setUploadErrors({});
    setUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast?.('Please choose an image file.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast?.('Image too large (max 10 MB).', 'error');
      return;
    }
    setUploadFile(file);
    setUploadForm(prev => ({ ...prev, title: prev.title || file.name.replace(/\.[^.]+$/, '') }));
    setFilePreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    const next = {};
    if (!uploadFile) next.file = 'Please choose an image file.';
    if (!uploadForm.title.trim()) next.title = 'Title is required.';
    else if (uploadForm.title.trim().length > 200) next.title = 'Title must be 200 characters or fewer.';
    setUploadErrors(next);
    if (Object.keys(next).length) return;

    setUploading(true);
    try {
      await uploadImage(uploadFile, {
        title: uploadForm.title.trim(),
        description: uploadForm.description.trim(),
        altText: uploadForm.altText.trim(),
        status: uploadForm.status
      });
      showToast?.('Image uploaded to media library.', 'success');
      setUploadModal(false);
      if (filePreview) URL.revokeObjectURL(filePreview);
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setUploading(false);
    }
  };

  // ---- edit metadata ----
  const openEdit = (img) => {
    setEditing(img);
    setEditForm({
      title: img.title || '',
      description: img.description || '',
      altText: img.altText || '',
      status: img.status || 'DRAFT'
    });
  };

  const handleEditSave = async () => {
    if (!editing || editSaving) return;
    if (!editForm.title.trim()) {
      showToast?.('Title is required.', 'error');
      return;
    }
    setEditSaving(true);
    try {
      await updateImage(editing._id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        altText: editForm.altText.trim(),
        status: editForm.status
      });
      showToast?.('Image details updated.', 'success');
      setEditing(null);
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleStatus = async (img) => {
    try {
      await updateImage(img._id, { status: img.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
      showToast?.(img.status === 'PUBLISHED' ? 'Image moved back to draft.' : 'Image published & live.', 'success');
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    }
  };

  // ---- delete ----
  const handleDelete = async () => {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    try {
      await deleteImage(deleting._id);
      showToast?.('Image deleted (removed from library and Cloudinary).', 'warning');
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
            <Images className="w-6 h-6 text-red-500" /> Media Images Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload and manage image assets stored on Cloudinary — used across the website.
          </p>
        </div>

        <button
          onClick={openUpload}
          className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition duration-200 active:scale-95 shrink-0 cursor-pointer"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Image</span>
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
            placeholder="Search by image title..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition"
          />
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

      {/* Images Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Total Images: <strong className="text-slate-900 dark:text-white">{total}</strong></span>
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
            <span className="text-xs">Loading images...</span>
          </div>
        ) : images.length === 0 && !loadError ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <ImageIcon className="w-8 h-8" />
            <span>No images found. Upload your first image to get started.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img._id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col"
              >
                {/* Thumbnail */}
                <div
                  className="relative h-40 bg-slate-200 dark:bg-slate-900 group cursor-pointer"
                  onClick={() => setLightbox(img)}
                >
                  {img.url ? (
                    <img src={img.url} alt={img.altText || img.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-400" /></div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 flex items-center justify-center transition">
                    <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <span className="absolute top-2 left-2 bg-slate-950/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                    {img.width && img.height ? `${img.width}×${img.height}` : (img.format || 'IMG').toUpperCase()}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(img); }}
                    className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 transition ${
                      img.status === 'PUBLISHED'
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-slate-950/80 text-slate-300'
                    }`}
                    title="Click to toggle publish status"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${img.status === 'PUBLISHED' ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                    {img.status === 'PUBLISHED' ? 'Live' : 'Draft'}
                  </button>
                </div>

                {/* Meta */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug" title={img.title}>
                      {img.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{fmtBytes(img.bytes)}</span>
                      <span>{img.format ? img.format.toUpperCase() : '—'}</span>
                      <span>{fmtDate(img.createdAt)}</span>
                    </div>
                    {img.createdBy?.name && (
                      <p className="text-[10px] text-slate-400 mt-0.5">by {img.createdBy.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(img)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      onClick={() => setDeleting(img)}
                      className="text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
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

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-red-600" /> Upload Image
              </h3>
              <button onClick={() => !uploading && setUploadModal(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl overflow-hidden border-2 border-dashed ${uploadErrors.file ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} h-44 flex items-center justify-center cursor-pointer hover:border-red-500 transition bg-slate-50 dark:bg-slate-950`}
              >
                {filePreview ? (
                  <img src={filePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-slate-400 flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8" />
                    <span>Click to choose an image (max 10 MB)</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              {uploadErrors.file && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {uploadErrors.file}</p>}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  maxLength={200}
                  className={fieldCls(uploadErrors.title)}
                />
                {uploadErrors.title && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {uploadErrors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Description (optional)</label>
                <textarea
                  rows="2"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  maxLength={1000}
                  className={fieldCls(false)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Alt Text</label>
                  <input
                    type="text"
                    value={uploadForm.altText}
                    onChange={(e) => setUploadForm({ ...uploadForm, altText: e.target.value })}
                    maxLength={300}
                    className={fieldCls(false)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Status</label>
                  <select
                    value={uploadForm.status}
                    onChange={(e) => setUploadForm({ ...uploadForm, status: e.target.value })}
                    className={fieldCls(false)}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published (Live)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setUploadModal(false)}
                disabled={uploading}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-60"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-500" /> Edit Image Details
              </h3>
              <button onClick={() => setEditing(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {editing.url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-40 bg-slate-100 dark:bg-slate-950">
                  <img src={editing.url} alt="" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  maxLength={200}
                  className={fieldCls(false)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Description</label>
                <textarea
                  rows="2"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  maxLength={1000}
                  className={fieldCls(false)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Alt Text</label>
                  <input
                    type="text"
                    value={editForm.altText}
                    onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                    maxLength={300}
                    className={fieldCls(false)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className={fieldCls(false)}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published (Live)</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">The image file itself cannot be replaced — upload a new image instead. Only title, description, alt text and status can be edited.</p>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                disabled={editSaving}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-60"
              >
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="max-w-4xl w-full space-y-3">
            <img src={lightbox.url} alt={lightbox.altText || lightbox.title} className="max-h-[75vh] w-full object-contain rounded-2xl" />
            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
              <div>
                <p className="font-bold text-white">{lightbox.title}</p>
                <p className="text-slate-400 mt-0.5 font-mono text-[10px] truncate max-w-md">{lightbox.url}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(lightbox.url); showToast?.('Image URL copied.', 'success'); }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold shrink-0"
              >
                Copy URL
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
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Delete this image?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              “{deleting.title}” — the image is permanently removed from the library <strong className="text-red-500">and deleted from Cloudinary</strong>. Anywhere it is already embedded on the site will break.
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
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
