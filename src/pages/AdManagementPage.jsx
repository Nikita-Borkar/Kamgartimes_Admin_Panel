import React, { useState } from 'react';
import { Megaphone, PlusCircle, Eye, MousePointer, Calendar, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function AdManagementPage({ ads, onAddAd, onDeleteAd }) {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [position, setPosition] = useState('Header Banner (728x90)');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddAd({
      id: Date.now(),
      title: title.trim(),
      client: client.trim() || 'Labor Welfare Board',
      position: position,
      clicks: 0,
      impressions: 1200,
      expiryDate: '30 Nov 2026',
      status: 'Active'
    });

    setTitle('');
    setClient('');
  };

  const totalPages = Math.ceil(ads.length / itemsPerPage) || 1;
  const paginatedAds = ads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex items-center justify-between transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" />
            Ad Banners & Monetization Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage main page header banners, sidebar sticky ads, click counters & clients.
          </p>
        </div>

        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          {ads.length} Active Banners
        </span>
      </div>

      {/* Add Form (TEXTAREA FOR CAMPAIGN TITLE) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-500" /> Book New Ad Banner Slot
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campaign Title (Hindi / English)*</label>
            <textarea
              rows="2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ई-श्रम कार्ड मुफ्त पंजीकरण एवं स्वास्थ्य सुरक्षा बीमा अभियान..."
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none leading-snug"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Client / Sponsor Name</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. LIC / Labor Protection Board"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Launch Banner</span>
            </button>
          </div>

        </form>
      </div>

      {/* Ads List Table with S.No. & Pagination */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl w-12 text-center">S.No.</th>
                <th className="p-3.5">Campaign Title</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Slot Position</th>
                <th className="p-3.5">Clicks</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedAds.map((ad, idx) => {
                const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr key={ad.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-400 dark:text-slate-500 text-center">
                      #{serialNo}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white font-serif">{ad.title}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">{ad.client}</td>
                    <td className="p-3.5 text-amber-600 dark:text-amber-400 font-medium">{ad.position}</td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <MousePointer className="w-3.5 h-3.5 text-emerald-500" />
                      {ad.clicks.toLocaleString()} Clicks
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{ad.expiryDate}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onDeleteAd(ad.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        title="Delete Ad Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={ads.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

      </div>

    </div>
  );
}
