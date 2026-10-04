import React, { useState } from 'react';
import { FileText, Upload, Calendar, Download, Eye, Trash2, PlusCircle, CheckCircle2 } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function EPaperManagementPage({ epapers, onAddEPaper, onDeleteEPaper }) {
  const [editionDate, setEditionDate] = useState('26 Sep 2026');
  const [city, setCity] = useState('Mumbai Main Edition');
  const [totalPages, setTotalPages] = useState('12');
  const [pdfUrl, setPdfUrl] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const handleSubmit = (e) => {
    e.preventDefault();

    onAddEPaper({
      id: Date.now(),
      editionDate: editionDate,
      city: city,
      totalPages: parseInt(totalPages) || 12,
      pdfSize: '12.5 MB',
      downloads: 0,
      status: 'Published',
      thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80'
    });

    setPdfUrl('');
  };

  const totalPagesCount = Math.ceil(epapers.length / itemsPerPage) || 1;
  const paginatedEPapers = epapers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-500" />
            Digital e-Paper Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload and archive daily digital newspaper editions (PDF / Image pages).
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          Today's e-Paper is Live
        </span>
      </div>

      {/* Upload Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-500" /> Publish New e-Paper Edition
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Edition Date</label>
            <input
              type="text"
              value={editionDate}
              onChange={(e) => setEditionDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City / Region Edition</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="Mumbai Main Edition">Mumbai Main Edition</option>
              <option value="Nagpur & Vidarbha">Nagpur & Vidarbha</option>
              <option value="Pune & West Maharashtra">Pune & West Maharashtra</option>
              <option value="Delhi National Edition">Delhi National Edition</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Pages</label>
            <input
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF</span>
            </button>
          </div>

        </form>
      </div>

      {/* Editions Grid with S.No. & Pagination */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paginatedEPapers.map((ep, idx) => {
            const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
              <div key={ep.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img src={ep.thumbnail} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    #{serialNo}
                  </span>
                  <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow">
                    {ep.status}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif">{ep.city}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ep.editionDate} • {ep.totalPages} Pages ({ep.pdfSize})</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <Download className="w-3.5 h-3.5" /> {ep.downloads} Downloads
                  </span>

                  <button
                    onClick={() => onDeleteEPaper(ep.id)}
                    className="text-red-600 dark:text-red-400 hover:underline font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPagesCount}
          totalItems={epapers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

    </div>
  );
}
