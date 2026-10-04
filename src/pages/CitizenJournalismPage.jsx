import React, { useState } from 'react';
import { Search, Eye, Trash2, CheckCircle, Clock, ShieldCheck, X } from 'lucide-react';

export default function CitizenJournalismPage() {
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      name: 'Ramesh Patel',
      phone: '9876543210',
      city: 'Nagpur',
      title: 'Water logging in Dharampeth area',
      details: 'Due to heavy rains, the whole area is flooded. No authorities are responding.',
      status: 'Pending',
      date: '2026-09-30',
      hasFile: true
    },
    {
      id: 2,
      name: 'Suresh Kumar',
      phone: '8765432109',
      city: 'Pune',
      title: 'Traffic jam at Hinjewadi',
      details: 'Massive traffic jam for the last 3 hours.',
      status: 'Reviewed',
      date: '2026-09-29',
      hasFile: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);

  const filteredSubmissions = submissions.filter(sub => 
    sub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id, newStatus) => {
    setSubmissions(submissions.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      setSubmissions(submissions.filter(sub => sub.id !== id));
      setSelectedNews(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Citizen Journalism Submissions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage news sent by the public</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        
        {/* Search */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 mb-6 w-full max-w-md">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by title, name, or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm w-full ml-3 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-l-xl font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Reporter Name</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Headline</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 rounded-r-xl font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubmissions.length > 0 ? filteredSubmissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-4">{sub.date}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{sub.name}</div>
                    <div className="text-xs text-slate-500">{sub.phone}</div>
                  </td>
                  <td className="px-4 py-4">{sub.city}</td>
                  <td className="px-4 py-4 max-w-[200px] truncate">{sub.title}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      sub.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    }`}>
                      {sub.status === 'Pending' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => setSelectedNews(sub)}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 rounded-lg mr-2 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">No submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submission Details</h2>
              <button 
                onClick={() => setSelectedNews(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Reporter Name</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedNews.name}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Contact</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedNews.phone}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 mb-1">City</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedNews.city}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Date</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedNews.date}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">Headline</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedNews.title}</h3>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">Detailed Report</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedNews.details}
                </div>
              </div>

              {selectedNews.hasFile && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">Attached Media</p>
                  <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <span className="text-sm font-medium">📎 User has attached a file (Image/Video)</span>
                    <button className="ml-auto text-xs font-bold bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
              <button 
                onClick={() => setSelectedNews(null)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Close
              </button>
              {selectedNews.status === 'Pending' ? (
                <button 
                  onClick={() => {
                    handleStatusChange(selectedNews.id, 'Reviewed');
                    setSelectedNews(null);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 transition-all text-sm"
                >
                  Mark as Reviewed
                </button>
              ) : (
                <button 
                  onClick={() => {
                    handleStatusChange(selectedNews.id, 'Pending');
                    setSelectedNews(null);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20 transition-all text-sm"
                >
                  Mark as Pending
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
