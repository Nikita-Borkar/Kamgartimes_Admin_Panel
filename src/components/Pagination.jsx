import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  onItemsPerPageChange
}) {
  if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
      
      {/* Left: Item Counter Info */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{totalItems > 0 ? startItem : 0}</strong> to <strong className="text-slate-900 dark:text-white">{endItem}</strong> of <strong className="text-slate-900 dark:text-white">{totalItems}</strong> entries
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map(num => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`w-8 h-8 rounded-lg font-bold text-xs transition ${
              currentPage === num 
                ? 'bg-red-600 text-white shadow-md' 
                : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
