import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCart, Plus, Search, Eye, Download, Printer,
  RotateCcw, Trash2, Calendar, User, Package, Warehouse,
  DollarSign, CheckCircle, AlertCircle, PlusCircle, X
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

import { selectAllSales, addSale, returnSale, deleteSale } from '../store/slices/salesSlice';
import { selectAllProducts, updateStock } from '../store/slices/productsSlice';
import { selectAllWarehouses } from '../store/slices/warehousesSlice';
import { addMovement } from '../store/slices/movementsSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import { formatCurrency, formatDate, paginate, generateId } from '../utils/helpers';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export default function SalesPage() {
  const dispatch = useDispatch();

  const sales = useSelector(selectAllSales);
  const products = useSelector(selectAllProducts);
  const warehouses = useSelector(selectAllWarehouses);
  const settings = useSelector(selectSettings);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [isReturnConfirmOpen, setIsReturnConfirmOpen] = useState(false);
  const [returningSale, setReturningSale] = useState(null);

  // Form State
  const initialForm = {
    customerName: 'Retail Customer',
    warehouseId: warehouses[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [
      { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.sellingPrice || 100, tax: 18, discount: 0 }
    ],
  };
  const [formData, setFormData] = useState(initialForm);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchSearch = !searchQuery ||
        s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = !selectedStatus || s.status === selectedStatus;
      const matchWh = !selectedWarehouse || s.warehouseId === selectedWarehouse;

      return matchSearch && matchStatus && matchWh;
    });
  }, [sales, searchQuery, selectedStatus, selectedWarehouse]);

  const paginatedResult = useMemo(() => {
    return paginate(filteredSales, currentPage, perPage);
  }, [filteredSales, currentPage, perPage]);

  // Form calculations
  const calculatedTotals = useMemo(() => {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    formData.items.forEach(item => {
      const lineSubtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      const lineDiscount = lineSubtotal * ((Number(item.discount) || 0) / 100);
      const lineTaxable = lineSubtotal - lineDiscount;
      const lineTax = lineTaxable * ((Number(item.tax) || 0) / 100);

      subtotal += lineSubtotal;
      discountAmount += lineDiscount;
      taxAmount += lineTax;
    });

    const grandTotal = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, grandTotal };
  }, [formData.items]);

  // Open Add Sale Modal
  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      warehouseId: warehouses[0]?.id || '',
      items: [
        { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.sellingPrice || 100, tax: 18, discount: 0 }
      ],
    });
    setIsFormOpen(true);
  };

  // Line Item Handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;

    if (field === 'productId') {
      const p = products.find(prod => prod.id === value);
      if (p) updated[index].unitPrice = p.sellingPrice;
    }
    setFormData({ ...formData, items: updated });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.sellingPrice || 100, tax: 18, discount: 0 }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      toast.error('Sale transaction must contain at least 1 item');
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== index)
    });
  };

  // Complete Sale
  const handleCompleteSale = (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    // 1. INVENTORY AVAILABILITY VALIDATION
    for (const it of formData.items) {
      const prod = products.find(p => p.id === it.productId);
      const reqQty = Number(it.quantity);

      if (!prod) {
        toast.error('Invalid product selected');
        return;
      }
      if (reqQty <= 0) {
        toast.error(`Quantity for ${prod.name} must be greater than zero`);
        return;
      }
      if (reqQty > prod.stock) {
        toast.error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${reqQty}`);
        return;
      }
    }

    const now = new Date().toISOString();
    const invoiceNum = `INV-2026-${String(sales.length + 1).padStart(4, '0')}`;

    // 2. DEDUCT STOCK & RECORD MOVEMENTS
    const saleItems = formData.items.map(it => {
      const prod = products.find(p => p.id === it.productId);
      const qty = Number(it.quantity);
      const price = Number(it.unitPrice);

      // Deduct stock
      dispatch(updateStock({ productId: it.productId, quantity: qty, operation: 'subtract' }));

      // Record movement
      dispatch(addMovement({
        productId: it.productId,
        productName: prod.name,
        sku: prod.sku,
        warehouseId: formData.warehouseId,
        type: 'sales_issued',
        quantity: -qty,
        previousBalance: prod.stock,
        newBalance: prod.stock - qty,
        reference: invoiceNum,
        notes: `Sales invoice #${invoiceNum} issued to ${formData.customerName}`,
        date: now,
      }));

      return {
        productId: it.productId,
        productName: prod.name,
        sku: prod.sku,
        quantity: qty,
        unitPrice: price,
        costPrice: prod.costPrice,
        tax: Number(it.tax) || 18,
        discount: Number(it.discount) || 0,
        total: qty * price,
      };
    });

    // 3. RECORD SALE TRANSACTION
    dispatch(addSale({
      invoiceNumber: invoiceNum,
      date: new Date(formData.date).toISOString(),
      warehouseId: formData.warehouseId,
      customerName: formData.customerName,
      items: saleItems,
      subtotal: calculatedTotals.subtotal,
      discountAmount: calculatedTotals.discountAmount,
      taxAmount: calculatedTotals.taxAmount,
      grandTotal: calculatedTotals.grandTotal,
      status: 'completed',
      notes: formData.notes,
    }));

    toast.success(`Sale ${invoiceNum} completed. Stock balances updated.`);
    setIsFormOpen(false);
  };

  // Process Sales Return (Restores stock)
  const handleConfirmReturn = () => {
    if (!returningSale) return;

    const now = new Date().toISOString();

    // Restore stock for all items
    returningSale.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const curStock = prod?.stock || 0;

      dispatch(updateStock({ productId: it.productId, quantity: it.quantity, operation: 'add' }));

      dispatch(addMovement({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        warehouseId: returningSale.warehouseId,
        type: 'stock_return',
        quantity: it.quantity,
        previousBalance: curStock,
        newBalance: curStock + it.quantity,
        reference: `RET-${returningSale.invoiceNumber}`,
        notes: `Goods returned against invoice #${returningSale.invoiceNumber}`,
        date: now,
      }));
    });

    dispatch(returnSale(returningSale.id));
    toast.success(`Returned invoice #${returningSale.invoiceNumber}. Stock restored.`);
    setReturningSale(null);
    setIsReturnConfirmOpen(false);
  };

  // Download PDF Invoice
  const handleDownloadInvoice = (sale) => {
    generateInvoicePDF({
      invoice: sale,
      type: 'sale',
      businessName: settings.businessName || 'StockWise Inventory Solutions',
    });
    toast.success(`Downloaded ${sale.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & Invoices"
        subtitle="Customer billing, automated stock deduction, invoice PDFs & returns management"
      >
        <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5">
          <Plus size={16} />
          <span>New Sales Order</span>
        </button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by invoice # or customer..."
            className="input-field pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="select-field text-xs py-2 w-36"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="returned">Returned</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => { setSelectedWarehouse(e.target.value); setCurrentPage(1); }}
            className="select-field text-xs py-2 w-44"
          >
            <option value="">All Fulfillment Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        {filteredSales.length === 0 ? (
          <EmptyState
            title="No sales transactions found"
            description="Create a sales order to deduct stock and generate an invoice."
            action={handleOpenAdd}
            actionLabel="Create Sales Order"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-secondary/60 text-xs font-semibold text-text-secondary uppercase">
                  <th className="px-4 py-3.5 text-left">Invoice #</th>
                  <th className="px-4 py-3.5 text-left">Date</th>
                  <th className="px-4 py-3.5 text-left">Customer</th>
                  <th className="px-4 py-3.5 text-left">Fulfillment Warehouse</th>
                  <th className="px-4 py-3.5 text-right">Items</th>
                  <th className="px-4 py-3.5 text-right">Subtotal</th>
                  <th className="px-4 py-3.5 text-right">Grand Total</th>
                  <th className="px-4 py-3.5 text-left">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedResult.items.map(s => {
                  const wh = warehouses.find(w => w.id === s.warehouseId);

                  return (
                    <tr key={s.id} className="hover:bg-background-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">
                        {s.invoiceNumber}
                      </td>

                      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(s.date)}
                      </td>

                      <td className="px-4 py-3 font-medium text-text-primary">
                        {s.customerName}
                      </td>

                      <td className="px-4 py-3 text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">{wh?.code}</span> ({wh?.city})
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {s.items.reduce((sum, it) => sum + it.quantity, 0)} units ({s.items.length} SKUs)
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                        {formatCurrency(s.subtotal, settings.currencySymbol)}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">
                        {formatCurrency(s.grandTotal, settings.currencySymbol)}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingSale(s)}
                            className="p-1.5 rounded hover:bg-background-secondary text-text-secondary hover:text-primary"
                            title="Inspect Invoice"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleDownloadInvoice(s)}
                            className="p-1.5 rounded hover:bg-background-secondary text-text-secondary hover:text-primary"
                            title="Download PDF"
                          >
                            <Download size={15} />
                          </button>

                          {s.status === 'completed' && (
                            <button
                              onClick={() => { setReturningSale(s); setIsReturnConfirmOpen(true); }}
                              className="p-1.5 rounded hover:bg-orange-50 text-text-secondary hover:text-orange-600"
                              title="Sales Return (Restore Stock)"
                            >
                              <RotateCcw size={15} />
                            </button>
                          )}
                        </div>
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
          totalItems={filteredSales.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Create Sales Order Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create New Sales Order & Invoice"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-sm font-bold text-text-primary">
              Grand Total: {formatCurrency(calculatedTotals.grandTotal, settings.currencySymbol)}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsFormOpen(false)} className="btn-secondary btn-sm">Cancel</button>
              <button onClick={handleCompleteSale} className="btn-primary btn-sm">Complete & Deduct Stock</button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleCompleteSale} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Customer Name *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Walk-in Customer / Corporate Client"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Fulfillment Warehouse *</label>
              <select
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="select-field"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text">Invoice Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Line Items for Dispatch</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <PlusCircle size={14} /> Add Product
              </button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-background-secondary/60 border-b border-border text-text-secondary">
                  <tr>
                    <th className="p-2.5 text-left">Product</th>
                    <th className="p-2.5 w-24 text-right">Available</th>
                    <th className="p-2.5 w-24 text-right">Qty to Sell</th>
                    <th className="p-2.5 w-28 text-right">Selling Price</th>
                    <th className="p-2.5 w-20 text-right">Tax %</th>
                    <th className="p-2.5 w-20 text-right">Disc %</th>
                    <th className="p-2.5 w-28 text-right">Total</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {formData.items.map((it, idx) => {
                    const prod = products.find(p => p.id === it.productId);
                    const lineSub = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
                    const lineDisc = lineSub * ((Number(it.discount) || 0) / 100);
                    const lineTax = (lineSub - lineDisc) * ((Number(it.tax) || 0) / 100);
                    const total = lineSub - lineDisc + lineTax;

                    return (
                      <tr key={idx}>
                        <td className="p-2">
                          <select
                            value={it.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            className="select-field text-xs py-1.5"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2 text-right font-mono font-semibold text-text-secondary">
                          {prod?.stock || 0}
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            max={prod?.stock || 1}
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="input-field text-xs py-1.5 text-right font-mono"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={it.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="input-field text-xs py-1.5 text-right font-mono"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={it.tax}
                            onChange={(e) => handleItemChange(idx, 'tax', e.target.value)}
                            className="input-field text-xs py-1.5 text-right font-mono"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={it.discount}
                            onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                            className="input-field text-xs py-1.5 text-right font-mono"
                          />
                        </td>

                        <td className="p-2 text-right font-mono font-bold text-text-primary">
                          {formatCurrency(total, settings.currencySymbol)}
                        </td>

                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-text-tertiary hover:text-danger p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-3 border-t border-border text-xs">
            <div className="w-full sm:w-1/2">
              <label className="label-text">Invoice Remarks / Customer Note</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Payment terms, delivery instructions..."
                className="input-field resize-none"
              />
            </div>

            <div className="w-full sm:w-72 space-y-1.5 bg-background-secondary/50 p-3 rounded-lg">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(calculatedTotals.subtotal, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Discount Applied:</span>
                <span className="font-mono text-danger">-{formatCurrency(calculatedTotals.discountAmount, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>GST Tax (18%):</span>
                <span className="font-mono">+{formatCurrency(calculatedTotals.taxAmount, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-text-primary font-bold text-sm pt-2 border-t border-border">
                <span>Grand Total:</span>
                <span className="font-mono text-primary">{formatCurrency(calculatedTotals.grandTotal, settings.currencySymbol)}</span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Sales Invoice Modal */}
      <Modal
        isOpen={Boolean(viewingSale)}
        onClose={() => setViewingSale(null)}
        title={`Sales Invoice: ${viewingSale?.invoiceNumber}`}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => handleDownloadInvoice(viewingSale)}
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <Download size={14} /> Download PDF
            </button>
            <button onClick={() => setViewingSale(null)} className="btn-secondary btn-sm">Close</button>
          </div>
        }
      >
        {viewingSale && (
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-background-secondary/50 rounded-xl">
              <div>
                <span className="text-xs text-text-secondary block">Customer</span>
                <span className="font-semibold text-text-primary">{viewingSale.customerName}</span>
              </div>
              <div>
                <span className="text-xs text-text-secondary block">Warehouse</span>
                <span className="font-semibold text-text-primary">
                  {warehouses.find(w => w.id === viewingSale.warehouseId)?.name}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-secondary block">Date</span>
                <span className="font-medium text-text-primary">{formatDate(viewingSale.date)}</span>
              </div>
              <div>
                <span className="text-xs text-text-secondary block">Status</span>
                <StatusBadge status={viewingSale.status} />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-2">Invoice Items</h4>
              <div className="card overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-background-secondary/60 border-b border-border">
                    <tr className="text-left text-text-secondary">
                      <th className="p-3">Product Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewingSale.items.map(it => (
                      <tr key={it.productId}>
                        <td className="p-3 font-medium text-text-primary">{it.productName}</td>
                        <td className="p-3 font-mono text-text-secondary">{it.sku}</td>
                        <td className="p-3 text-right font-mono font-semibold">{it.quantity}</td>
                        <td className="p-3 text-right font-mono">{formatCurrency(it.unitPrice, settings.currencySymbol)}</td>
                        <td className="p-3 text-right font-mono font-bold">{formatCurrency(it.total, settings.currencySymbol)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2 bg-background-secondary/40 p-4 rounded-xl text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal:</span>
                  <span className="font-mono">{formatCurrency(viewingSale.subtotal, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tax:</span>
                  <span className="font-mono">+{formatCurrency(viewingSale.taxAmount, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Discount:</span>
                  <span className="font-mono text-danger">-{formatCurrency(viewingSale.discountAmount, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                  <span>Grand Total:</span>
                  <span className="font-mono text-primary">{formatCurrency(viewingSale.grandTotal, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Return Sale Confirmation */}
      <ConfirmDialog
        isOpen={isReturnConfirmOpen}
        onClose={() => { setIsReturnConfirmOpen(false); setReturningSale(null); }}
        onConfirm={handleConfirmReturn}
        title="Process Sales Return"
        message={`Are you sure you want to process a full return for invoice "${returningSale?.invoiceNumber}"? This will restore all sold merchandise quantities back into the warehouse and log return movement entries.`}
        confirmText="Confirm Return"
        variant="warning"
      />
    </div>
  );
}
