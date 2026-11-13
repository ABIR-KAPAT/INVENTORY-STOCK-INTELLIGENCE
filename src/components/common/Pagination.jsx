import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, totalItems, onPageChange, perPage = 20 }) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let startP = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endP = Math.min(totalPages, startP + maxVisible - 1);
    if (endP - startP + 1 < maxVisible) {
      startP = Math.max(1, endP - maxVisible + 1);
    }
    for (let i = startP; i <= endP; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="text-sm text-text-secondary">
        Showing <span className="font-medium text-text-primary">{start}</span> to{' '}
        <span className="font-medium text-text-primary">{end}</span> of{' '}
        <span className="font-medium text-text-primary">{totalItems}</span> results
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-background-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        {getPages().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
              page === currentPage
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-background-secondary'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-background-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
