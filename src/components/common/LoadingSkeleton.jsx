import React from 'react';

export default function LoadingSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3 border-b border-border last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="flex-1">
              <div className={`h-4 bg-gray-200 rounded ${c === 0 ? 'w-3/4' : 'w-1/2'}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
