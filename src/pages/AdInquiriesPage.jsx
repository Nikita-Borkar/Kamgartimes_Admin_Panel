import React, { useState } from 'react';
import { Search, Eye, Trash2, CheckCircle, Clock, Megaphone, X } from 'lucide-react';

export default function AdInquiriesPage() {
  const [inquiries, setInquiries] = useState([
    {
      id: 1,
      name: 'Amit Sharma',
      email: 'amit@business.com',
      phone: '9988776655',
      address: 'Sitabuldi, Nagpur',
      details: 'I want to place a banner ad for my new clothing store for 1 month.',
      status: 'Pending',
      date: '2026-09-30',
      hasFile: true
    },
    {
      id: 2,
      name: 'Priya Desai',
      email: 'priya.desai@brand.in',
      phone: '8877665544',
      address: 'Andheri, Mumbai',
      details: 'Looking for rates for a full page popup ad.',
      status: 'Contacted',
      date: '2026-09-28',
      hasFile: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const filteredInquiries = inquiries.filter(inq => 
    inq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.phone.includes(searchTerm)
  );

  const handleStatusChange = (id, newStatus) => {
    setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this ad inquiry?')) {
      setInquiries(inquiries.filter(inq => inq.id !== id));
      setSelectedInquiry(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-red-500" />
            Advertisement Inquiries
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage ad requests submitted by businesses & users</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        
        {/* Search */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 mb-6 w-full max-w-md">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name, email or phone..."
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
                <th className="px-4 py-3 font-medium">Client Info</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 rounded-r-xl font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInquiries.length > 0 ? filteredInquiries.map(inq => (
                <tr key={inq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-4">{inq.date}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{inq.name}</div>
                    <div className="text-xs text-slate-500">{inq.email} | {inq.phone}</div>
                  </td>
                  <td className="px-4 py-4 max-w-[150px] truncate">{inq.address}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inq.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                    }`}>
                      {inq.status === 'Pending' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {inq.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => setSelectedInquiry(inq)}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 rounded-lg mr-2 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(inq.id)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">No ad inquiries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ad Inquiry Details</h2>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Name</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedInquiry.name}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Phone</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedInquiry.phone}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Email</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedInquiry.email}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Date</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedInquiry.date}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">Address</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                  {selectedInquiry.address}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">Advertisement Details</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedInquiry.details}
                </div>
              </div>

              {selectedInquiry.hasFile && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">Submitted Creative (Image/Video)</p>
                  <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
                    <span className="text-sm font-medium">📎 Client attached an ad creative file</span>
                    <button className="ml-auto text-xs font-bold bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Close
              </button>
              {selectedInquiry.status === 'Pending' ? (
                <button 
                  onClick={() => {
                    handleStatusChange(selectedInquiry.id, 'Contacted');
                    setSelectedInquiry(null);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all text-sm"
                >
                  Mark as Contacted
                </button>
              ) : (
                <button 
                  onClick={() => {
                    handleStatusChange(selectedInquiry.id, 'Pending');
                    setSelectedInquiry(null);
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
