import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// Generate unique IDs
let counter = Date.now();
export function generateId(prefix = '') {
  counter++;
  return `${prefix}${counter.toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
}

// For seed data compatibility
export function v4() {
  return generateId('');
}

// Format currency
export function formatCurrency(amount, symbol = '₹') {
  if (amount === null || amount === undefined || isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format date
export function formatDate(dateStr, fmt = 'dd/MM/yyyy') {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (!isValid(date)) return '-';
    return format(date, fmt);
  } catch {
    return '-';
  }
}

// Format relative time
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (!isValid(date)) return '-';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '-';
  }
}

// Calculate profit margin
export function calcMargin(cost, selling) {
  if (!selling || selling === 0) return 0;
  return ((selling - cost) / selling * 100).toFixed(1);
}

// Status colors
export function getStatusColor(status) {
  const colors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    low_stock: 'bg-yellow-100 text-yellow-700',
    out_of_stock: 'bg-red-100 text-red-700',
    in_stock: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-700',
    partially_received: 'bg-yellow-100 text-yellow-700',
    received: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700',
    returned: 'bg-orange-100 text-orange-700',
    pending: 'bg-yellow-100 text-yellow-700',
    overstock: 'bg-purple-100 text-purple-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

// Status labels
export function getStatusLabel(status) {
  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
    in_stock: 'In Stock',
    draft: 'Draft',
    sent: 'Sent',
    partially_received: 'Partially Received',
    received: 'Received',
    cancelled: 'Cancelled',
    completed: 'Completed',
    returned: 'Returned',
    pending: 'Pending',
    overstock: 'Overstock',
    purchase_received: 'Purchase Received',
    sales_issued: 'Sales Issued',
    stock_adjustment: 'Stock Adjustment',
    warehouse_transfer: 'Warehouse Transfer',
    stock_return: 'Stock Return',
    reserved: 'Reserved',
    released: 'Released',
  };
  return labels[status] || status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
}

// Movement type colors
export function getMovementColor(type) {
  const colors = {
    purchase_received: 'bg-green-100 text-green-700',
    sales_issued: 'bg-red-100 text-red-700',
    stock_adjustment: 'bg-blue-100 text-blue-700',
    warehouse_transfer: 'bg-purple-100 text-purple-700',
    stock_return: 'bg-orange-100 text-orange-700',
    reserved: 'bg-yellow-100 text-yellow-700',
    released: 'bg-teal-100 text-teal-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
}

// Search filter helper
export function matchesSearch(item, searchTerm, fields) {
  if (!searchTerm) return true;
  const term = searchTerm.toLowerCase();
  return fields.some(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], item);
    return value && String(value).toLowerCase().includes(term);
  });
}

// Pagination helper
export function paginate(items, page, perPage) {
  const totalPages = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    items: items.slice(start, end),
    totalPages,
    totalItems: items.length,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Sort helper
export function sortItems(items, sortKey, sortDir) {
  if (!sortKey) return items;
  return [...items].sort((a, b) => {
    let aVal = sortKey.split('.').reduce((obj, key) => obj?.[key], a);
    let bVal = sortKey.split('.').reduce((obj, key) => obj?.[key], b);
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

// Download CSV
export function downloadCSV(data, filename) {
  const Papa = window.Papa;
  if (!Papa) {
    import('papaparse').then(mod => {
      const csv = mod.default.unparse(data);
      triggerDownload(csv, filename, 'text/csv');
    });
  } else {
    const csv = Papa.unparse(data);
    triggerDownload(csv, filename, 'text/csv');
  }
}

export function triggerDownload(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Number formatting
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-IN');
}

// Percentage change
export function calcPercentChange(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(1);
}

// Debounce
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Stock status helper
export function getStockStatus(stock, reorderPoint, maxStock) {
  if (stock === 0) return 'out_of_stock';
  if (stock <= reorderPoint) return 'low_stock';
  if (maxStock && stock > maxStock) return 'overstock';
  return 'in_stock';
}
