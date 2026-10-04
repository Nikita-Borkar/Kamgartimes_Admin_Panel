import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, ShieldAlert, Trash2, ThumbsUp } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function PollsCommentsPage({ comments, onApproveComment, onDeleteComment }) {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(comments.length / itemsPerPage) || 1;
  const paginatedComments = comments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex items-center justify-between transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            Reader Comments & Moderation Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Approve public comments, mark spam or delete inappropriate feedback.
          </p>
        </div>

        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
          {comments.filter(c => c.status === 'Pending').length} Pending Comments
        </span>
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Reader Comments</h3>

        <div className="space-y-3">
          {paginatedComments.map((c, idx) => {
            const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
              <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">#{serialNo}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{c.author}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{c.date}</span>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-300 font-serif leading-relaxed italic">
                  "{c.comment}"
                </p>

                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Article: <span className="text-red-600 dark:text-red-400 font-semibold">{c.articleTitle}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    c.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {c.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {c.status !== 'Approved' && (
                      <button
                        onClick={() => onApproveComment(c.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow transition"
                      >
                        Approve Comment
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-4 h-4" />
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
          totalItems={comments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

      </div>

    </div>
  );
}
