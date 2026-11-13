import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  ArrowLeftRight, Search, Filter, Download, FileText,
  Calendar, Warehouse, Package, ArrowUpRight, ArrowDownRight,
  TrendingDown, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { selectAllMovements } from '../store/slices/movementsSlice';
import { selectAllProducts } from '../store/slices/productsSlice';
import { selectAllWarehouses } from '../store/slices/warehousesSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import {
  formatDate, paginate, sortItems, getMovementColor,
  getStatusLabel, downloadCSV
} from '../utils/helpers';
import { generatePDF } from '../utils/pdfGenerator';

export default function MovementsPage() {
  const movements = useSelector(selectAllMovements);
  const products = useSelector(selectAllProducts);
  const warehouses = useSelector(selectAllWarehouses);
  const settings = useSelector(selectSettings);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dateRange, setDateRange] = useState('all'); // all, 7, 30, 90

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Filtering Logic
  const filteredMovements = useMemo(() => {
    const now = new Date();

    return movements.filter(m => {
      // Search
      const matchSearch = !searchQuery ||
        m.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id?.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchType = !selectedType || m.type === selectedType;

      // Warehouse filter
      const matchWh = !selectedWarehouse || m.warehouseId === selectedWarehouse;

      // Product filter
      const matchProd = !selectedProduct || m.productId === selectedProduct;

      // Date range filter
      let matchDate = true;
      if (dateRange !== 'all') {
        const days = parseInt(dateRange, 10);
        const mDate = new Date(m.date);
        const diffDays = (now - mDate) / (1000 * 60 * 60 * 24);
        matchDate = diffDays <= days;
      }

      return matchSearch && matchType && matchWh && matchProd && matchDate;
    });
  }, [movements, searchQuery, selectedType, selectedWarehouse, selectedProduct, dateRange]);

  const paginatedResult = useMemo(() => {
    return paginate(filteredMovements, currentPage, perPage);
  }, [filteredMovements, currentPage, perPage]);

  // Export CSV
  const handleExportCSV = () => {
    const csvData = filteredMovements.map(m => ({
      TransactionID: m.id,
      Date: formatDate(m.date, 'yyyy-MM-dd HH:mm'),
      Product: m.productName,
      SKU: m.sku,
      Warehouse: warehouses.find(w => w.id === m.warehouseId)?.name || '',
      Type: m.type,
      Quantity: m.quantity,
      PreviousBalance: m.previousBalance,
      NewBalance: m.newBalance,
      Reference: m.reference,
      Notes: m.notes,
    }));
    downloadCSV(csvData, `stock_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Stock ledger exported as CSV');
  };

  // Export PDF
  const handleExportPDF = () => {
    generatePDF({
      title: 'Stock Movement Ledger Report',
      subtitle: `Official Audit Log • Total ${filteredMovements.length} Transactions`,
      columns: [
        { header: 'Date', accessor: (row) => formatDate(row.date, 'dd/MM/yyyy HH:mm') },
        { header: 'Product', accessor: (row) => row.productName },
        { header: 'SKU', accessor: (row) => row.sku },
        { header: 'Type', accessor: (row) => row.type.replace(/_/g, ' ') },
        { header: 'Qty', accessor: (row) => `${row.quantity > 0 ? '+' : ''}${row.quantity}` },
        { header: 'Prev', accessor: (row) => row.previousBalance },
        { header: 'New', accessor: (row) => row.newBalance },
        { header: 'Reference', accessor: (row) => row.reference },
      ],
      data: filteredMovements.slice(0, 200), // top 200 for clean PDF
      summary: [
        { label: 'Total Transactions', value: filteredMovements.length },
        { label: 'Net Unit Flow', value: filteredMovements.reduce((sum, m) => sum + m.quantity, 0) },
        { label: 'Warehouses Involved', value: warehouses.length },
      ],
      filename: `stock_ledger_${Date.now()}.pdf`,
    });
    toast.success('Generated PDF Report');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Movement Ledger"
        subtitle="Complete audit trail of inventory receipts, dispatches, variances and warehouse transfers"
      >
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary btn-sm flex items-center gap-1.5">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button onClick={handleExportPDF} className="btn-secondary btn-sm flex items-center gap-1.5">
            <FileText size={15} />
            <span>Export PDF</span>
          </button>
        </div>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by SKU, product, transaction ID or reference..."
              className="input-field pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="select-field text-xs py-2 w-44"
            >
              <option value="">All Movement Types</option>
              <option value="purchase_received">Purchase Received (+)</option>
              <option value="sales_issued">Sales Issued (-)</option>
              <option value="stock_adjustment">Stock Adjustment</option>
              <option value="warehouse_transfer">Warehouse Transfer</option>
              <option value="stock_return">Stock Return (+)</option>
              <option value="reserved">Stock Reserved</option>
              <option value="released">Stock Released</option>
            </select>

            <select
              value={selectedWarehouse}
              onChange={(e) => { setSelectedWarehouse(e.target.value); setCurrentPage(1); }}
              className="select-field text-xs py-2 w-40"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1); }}
              className="select-field text-xs py-2 w-32"
            >
              <option value="all">All Dates</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movement Table */}
      <div className="card overflow-hidden">
        {filteredMovements.length === 0 ? (
          <EmptyState
            title="No movement records found"
            description="Adjust your filters or initiate stock actions from the Inventory page."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-secondary/60 text-xs font-semibold text-text-secondary uppercase">
                  <th className="px-4 py-3.5 text-left">Transaction ID</th>
                  <th className="px-4 py-3.5 text-left">Date & Time</th>
                  <th className="px-4 py-3.5 text-left">Product / SKU</th>
                  <th className="px-4 py-3.5 text-left">Warehouse</th>
                  <th className="px-4 py-3.5 text-left">Type</th>
                  <th className="px-4 py-3.5 text-right">Quantity</th>
                  <th className="px-4 py-3.5 text-right">Prev Balance</th>
                  <th className="px-4 py-3.5 text-right">New Balance</th>
                  <th className="px-4 py-3.5 text-left">Reference</th>
                  <th className="px-4 py-3.5 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedResult.items.map(m => {
                  const wh = warehouses.find(w => w.id === m.warehouseId);
                  const isPositive = m.quantity > 0;
                  const isNeutral = m.quantity === 0;

                  return (
                    <tr key={m.id} className="hover:bg-background-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-text-secondary font-semibold">
                        {m.id}
                      </td>

                      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(m.date, 'dd MMM yyyy, HH:mm')}
                      </td>

                      <td className="px-4 py-3 font-medium text-text-primary">
                        <div className="truncate max-w-xs">{m.productName}</div>
                        <span className="text-xs font-mono text-text-secondary">{m.sku}</span>
                      </td>

                      <td className="px-4 py-3 text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">{wh?.code}</span> ({wh?.city})
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMovementColor(m.type)}`}>
                          {getStatusLabel(m.type)}
                        </span>
                      </td>

                      <td className={`px-4 py-3 text-right font-mono font-bold ${
                        isPositive ? 'text-success' : isNeutral ? 'text-text-secondary' : 'text-danger'
                      }`}>
                        {isPositive ? `+${m.quantity}` : m.quantity}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                        {m.previousBalance}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-xs font-bold text-text-primary">
                        {m.newBalance}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                        {m.reference || '-'}
                      </td>

                      <td className="px-4 py-3 text-xs text-text-secondary max-w-xs truncate" title={m.notes}>
                        {m.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={paginatedResult.totalPages}
          totalItems={filteredMovements.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
