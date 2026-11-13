import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function FilterDropdown({ label, value, onChange, options, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-field pr-8 text-sm"
      >
        <option value="">{label || 'All'}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
    </div>
  );
}
