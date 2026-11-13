import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ClipboardList, Plus, Search, Edit3, Trash2, Eye,
  Printer, Download, CheckCircle, Clock, XCircle, AlertTriangle,
  Package, Truck, Warehouse, Calendar, ArrowRight, X, PlusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

import {
  selectAllPurchaseOrders, addPurchaseOrder, updatePurchaseOrder,
  updatePOStatus, receivePOItems, deletePurchaseOrder
} from '../store/slices/purchaseOrdersSlice';
import { selectAllSuppliers } from '../store/slices/suppliersSlice';
import { selectAllWarehouses } from '../store/slices/warehousesSlice';
import { selectAllProducts, updateStock } from '../store/slices/productsSlice';
import { addMovement } from '../store/slices/movementsSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import { formatCurrency, formatDate, paginate, generateId } from '../utils/helpers';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export default function PurchaseOrdersPage() {
  const dispatch = useDispatch();

  const purchaseOrders = useSelector(selectAllPurchaseOrders);
  const suppliers = useSelector(selectAllSuppliers);
  const warehouses = useSelector(selectAllWarehouses);
  const products = useSelector(selectAllProducts);
  const settings = useSelector(selectSettings);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [viewingPO, setViewingPO] = useState(null);
  const [receivingPO, setReceivingPO] = useState(null);
  const [receiveQuantities, setReceiveQuantities] = useState({});
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancellingPO, setCancellingPO] = useState(null);

  // Form State
  const initialForm = {
    supplierId: suppliers[0]?.id || '',
    warehouseId: warehouses[0]?.id || '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [
      { productId: products[0]?.id || '', quantity: 10, unitPrice: products[0]?.costPrice || 100, tax: 18, discount: 0 }
    ],
  };
  const [formData, setFormData] = useState(initialForm);

  // Filtered POs
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchSearch = !searchQuery ||
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = !selectedStatus || po.status === selectedStatus;
      const matchWh = !selectedWarehouse || po.warehouseId === selectedWarehouse;

      return matchSearch && matchStatus && matchWh;
    });
  }, [purchaseOrders, searchQuery, selectedStatus, selectedWarehouse]);

  const paginatedResult = useMemo(() => {
    return paginate(filteredPOs, currentPage, perPage);
  }, [filteredPOs, currentPage, perPage]);

  // Form Calculations
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

  // Open Add PO
  const handleOpenAdd = () => {
    setEditingPO(null);
    setFormData({
      ...initialForm,
      supplierId: suppliers[0]?.id || '',
      warehouseId: warehouses[0]?.id || '',
      items: [
        { productId: products[0]?.id || '', quantity: 10, unitPrice: products[0]?.costPrice || 100, tax: 18, discount: 0 }
      ],
    });
    setIsFormOpen(true);
  };

  // Open Edit PO
  const handleOpenEdit = (po) => {
    if (po.status !== 'draft') {
      toast.error('Only Draft purchase orders can be edited');
      return;
    }
    setEditingPO(po);
    setFormData({
      supplierId: po.supplierId,
      warehouseId: po.warehouseId,
      orderDate: po.orderDate.split('T')[0],
      expectedDate: po.expectedDate.split('T')[0],
      notes: po.notes || '',
      items: po.items.map(it => ({
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        tax: it.tax || 18,
        discount: it.discount || 0,
      })),
    });
    setIsFormOpen(true);
  };

  // Line item handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;

    // If product changed, update default unitPrice
    if (field === 'productId') {
      const p = products.find(prod => prod.id === value);
      if (p) updated[index].unitPrice = p.costPrice;
    }
    setFormData({ ...formData, items: updated });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: products[0]?.id || '', quantity: 10, unitPrice: products[0]?.costPrice || 100, tax: 18, discount: 0 }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      toast.error('Purchase order must have at least one product');
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== index)
    });
  };

  // Save PO (Draft or Issued)
  const handleSubmitPO = (isDraft = true) => {
    if (formData.items.length === 0) {
      toast.error('Add at least one item');
      return;
    }

    const sup = suppliers.find(s => s.id === formData.supplierId);
    const enrichedItems = formData.items.map(it => {
      const p = products.find(prod => prod.id === it.productId);
      const qty = Number(it.quantity);
      const price = Number(it.unitPrice);
      return {
        productId: it.productId,
        productName: p?.name || 'Item',
        sku: p?.sku || '',
        quantity: qty,
        receivedQuantity: editingPO?.items.find(ei => ei.productId === it.productId)?.receivedQuantity || 0,
        unitPrice: price,
        tax: Number(it.tax) || 18,
        discount: Number(it.discount) || 0,
        total: qty * price,
      };
    });

    const payload = {
      supplierId: formData.supplierId,
      supplierName: sup?.name || 'Vendor',
      warehouseId: formData.warehouseId,
      orderDate: new Date(formData.orderDate).toISOString(),
      expectedDate: new Date(formData.expectedDate).toISOString(),
      items: enrichedItems,
      subtotal: calculatedTotals.subtotal,
      discountAmount: calculatedTotals.discountAmount,
      taxAmount: calculatedTotals.taxAmount,
      grandTotal: calculatedTotals.grandTotal,
      notes: formData.notes,
      status: isDraft ? 'draft' : 'sent',
    };

    if (editingPO) {
      dispatch(updatePurchaseOrder({ id: editingPO.id, ...payload }));
      toast.success(`Purchase Order ${editingPO.poNumber} updated`);
    } else {
      const poNum = `PO-2026-${String(purchaseOrders.length + 1).padStart(4, '0')}`;
      dispatch(addPurchaseOrder({ ...payload, poNumber: poNum }));
      toast.success(`Purchase order ${poNum} created as ${isDraft ? 'Draft' : 'Sent'}`);
    }
    setIsFormOpen(false);
  };

  // Mark PO as Sent
  const handleMarkSent = (po) => {
    dispatch(updatePOStatus({ id: po.id, status: 'sent' }));
    toast.success(`Purchase Order ${po.poNumber} marked as Sent to vendor`);
  };

  // Open Receive Stock Modal
  const handleOpenReceive = (po) => {
    setReceivingPO(po);
    const initialRec = {};
    po.items.forEach(it => {
      const remaining = it.quantity - (it.receivedQuantity || 0);
      initialRec[it.productId] = remaining > 0 ? remaining : 0;
    });
    setReceiveQuantities(initialRec);
  };

  // Execute Receiving (Updates inventory + logs movement!)
  const handleConfirmReceive = () => {
    if (!receivingPO) return;

    const receivedPayload = [];
    const now = new Date().toISOString();

    for (const it of receivingPO.items) {
      const recQty = Number(receiveQuantities[it.productId] || 0);
      const remaining = it.quantity - (it.receivedQuantity || 0);

      if (recQty > remaining) {
        toast.error(`Cannot receive ${recQty} units of ${it.productName}. Maximum remaining is ${remaining}.`);
        return;
      }

      if (recQty > 0) {
        receivedPayload.push({ productId: it.productId, quantity: recQty });

        // 1. UPDATE PHYSICAL INVENTORY
        dispatch(updateStock({ productId: it.productId, quantity: recQty, operation: 'add' }));

        // 2. RECORD AUDIT IN STOCK MOVEMENT LEDGER
        const p = products.find(prod => prod.id === it.productId);
        const curStock = p?.stock || 0;

        dispatch(addMovement({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          warehouseId: receivingPO.warehouseId,
          type: 'purchase_received',
          quantity: recQty,
          previousBalance: curStock,
          newBalance: curStock + recQty,
          reference: receivingPO.poNumber,
          notes: `Goods received against PO #${receivingPO.poNumber} from ${receivingPO.supplierName}`,
          date: now,
        }));
      }
    }

    if (receivedPayload.length === 0) {
      toast.error('Specify at least 1 unit to receive');
      return;
    }

    // 3. UPDATE PO RECORD STATUS (partially_received or received)
    dispatch(receivePOItems({ poId: receivingPO.id, receivedItems: receivedPayload }));

    toast.success(`Successfully received stock into warehouse for PO ${receivingPO.poNumber}`);
    setReceivingPO(null);
  };

  // Cancel PO
  const handleCancelPO = () => {
    if (cancellingPO) {
      dispatch(updatePOStatus({ id: cancellingPO.id, status: 'cancelled' }));
      toast.success(`Purchase order ${cancellingPO.poNumber} cancelled`);
      setCancellingPO(null);
      setIsCancelConfirmOpen(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = (po) => {
    generateInvoicePDF({
      invoice: po,
      type: 'purchase',
      businessName: settings.businessName || 'StockWise Inventory Solutions',
    });
    toast.success(`Downloaded ${po.poNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Order Management"
        subtitle="Inbound procurement, partial delivery inspection & automated stock receipt"
      >
        <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5">
          <Plus size={16} />
          <span>Create Purchase Order</span>
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
            placeholder="Search by PO number or supplier..."
            className="input-field pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="select-field text-xs py-2 w-40"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent to Supplier</option>
            <option value="partially_received">Partially Received</option>
            <option value="received">Fully Received</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => { setSelectedWarehouse(e.target.value); setCurrentPage(1); }}
            className="select-field text-xs py-2 w-44"
          >
            <option value="">All Destination Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PO Table */}
      <div className="card overflow-hidden">
        {filteredPOs.length === 0 ? (
          <EmptyState
            title="No purchase orders found"
            description="Create your first purchase order to procure stock from vendors."
            action={handleOpenAdd}
            actionLabel="Create Purchase Order"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-secondary/60 text-xs font-semibold text-text-secondary uppercase">
                  <th className="px-4 py-3.5 text-left">PO Number</th>
                  <th className="px-4 py-3.5 text-left">Supplier</th>
                  <th className="px-4 py-3.5 text-left">Destination Warehouse</th>
                  <th className="px-4 py-3.5 text-left">Order Date</th>
                  <th className="px-4 py-3.5 text-left">Expected Delivery</th>
                  <th className="px-4 py-3.5 text-right">Items / Lines</th>
                  <th className="px-4 py-3.5 text-right">Grand Total</th>
                  <th className="px-4 py-3.5 text-left">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedResult.items.map(po => {
                  const wh = warehouses.find(w => w.id === po.warehouseId);

                  return (
                    <tr key={po.id} className="hover:bg-background-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">
                        {po.poNumber}
                      </td>

                      <td className="px-4 py-3 font-medium text-text-primary">
                        {po.supplierName}
                      </td>

                      <td className="px-4 py-3 text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">{wh?.code}</span> ({wh?.city})
                      </td>

                      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(po.orderDate)}
                      </td>

                      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(po.expectedDate)}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {po.items.length} SKU{po.items.length > 1 ? 's' : ''} (
                        {po.items.reduce((s, it) => s + (it.receivedQuantity || 0), 0)}/{po.items.reduce((s, it) => s + it.quantity, 0)} units)
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">
                        {formatCurrency(po.grandTotal, settings.currencySymbol)}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={po.status} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingPO(po)}
                            className="p-1.5 rounded hover:bg-background-secondary text-text-secondary hover:text-primary"
                            title="Inspect Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleDownloadPDF(po)}
                            className="p-1.5 rounded hover:bg-background-secondary text-text-secondary hover:text-primary"
                            title="Download PDF Voucher"
                          >
                            <Download size={15} />
                          </button>

                          {po.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(po)}
                                className="p-1.5 rounded hover:bg-background-secondary text-text-secondary hover:text-primary"
                                title="Edit Draft"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                onClick={() => handleMarkSent(po)}
                                className="btn-primary btn-sm text-xs py-1 px-2.5 ml-1"
                              >
                                Send PO
                              </button>
                            </>
                          )}

                          {['sent', 'partially_received'].includes(po.status) && (
                            <button
                              onClick={() => handleOpenReceive(po)}
                              className="btn-primary btn-sm text-xs py-1 px-2.5 ml-1 bg-green-600 hover:bg-green-700"
                            >
                              Receive Stock
                            </button>
                          )}

                          {['draft', 'sent'].includes(po.status) && (
                            <button
                              onClick={() => { setCancellingPO(po); setIsCancelConfirmOpen(true); }}
                              className="p-1.5 rounded hover:bg-red-50 text-text-secondary hover:text-danger"
                              title="Cancel Order"
                            >
                              <XCircle size={15} />
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
          totalItems={filteredPOs.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Create / Edit Purchase Order Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPO ? `Edit Purchase Order: ${editingPO.poNumber}` : 'Create Purchase Order'}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-sm font-bold text-text-primary">
              Grand Total: {formatCurrency(calculatedTotals.grandTotal, settings.currencySymbol)}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsFormOpen(false)} className="btn-secondary btn-sm">Cancel</button>
              <button onClick={() => handleSubmitPO(true)} className="btn-secondary btn-sm">Save as Draft</button>
              <button onClick={() => handleSubmitPO(false)} className="btn-primary btn-sm">Issue & Send PO</button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Header Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label-text">Select Supplier *</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="select-field"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.paymentTerms})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text">Destination Warehouse *</label>
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
              <label className="label-text">Order Date</label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Expected Delivery</label>
              <input
                type="date"
                value={formData.expectedDate}
                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Order Line Items</h4>
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
                    <th className="p-2.5 w-24 text-right">Quantity</th>
                    <th className="p-2.5 w-28 text-right">Unit Cost</th>
                    <th className="p-2.5 w-20 text-right">Tax %</th>
                    <th className="p-2.5 w-20 text-right">Disc %</th>
                    <th className="p-2.5 w-28 text-right">Line Total</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {formData.items.map((it, idx) => {
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
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
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
              <label className="label-text">Procurement Notes / Instructions</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Shipping instructions, dock arrival requirements..."
                className="input-field resize-none"
              />
            </div>

            <div className="w-full sm:w-72 space-y-1.5 bg-background-secondary/50 p-3 rounded-lg">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(calculatedTotals.subtotal, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Total Discount:</span>
                <span className="font-mono text-danger">-{formatCurrency(calculatedTotals.discountAmount, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Applicable Tax:</span>
                <span className="font-mono">+{formatCurrency(calculatedTotals.taxAmount, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-text-primary font-bold text-sm pt-2 border-t border-border">
                <span>Grand Total:</span>
                <span className="font-mono text-primary">{formatCurrency(calculatedTotals.grandTotal, settings.currencySymbol)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Receive Stock Inspection Modal */}
      <Modal
        isOpen={Boolean(receivingPO)}
        onClose={() => setReceivingPO(null)}
        title={`Receive Goods: ${receivingPO?.poNumber}`}
        size="md"
        footer={
          <>
            <button onClick={() => setReceivingPO(null)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={handleConfirmReceive} className="btn-primary btn-sm bg-green-600 hover:bg-green-700">
              Confirm Stock Inwarding
            </button>
          </>
        }
      >
        {receivingPO && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              Confirm actual physical units received in warehouse. Receiving stock automatically increases physical
              available inventory balance and logs audit entries in the stock ledger.
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-background-secondary/60 border-b border-border text-text-secondary font-semibold">
                  <tr>
                    <th className="p-2.5 text-left">Product</th>
                    <th className="p-2.5 text-right">Ordered</th>
                    <th className="p-2.5 text-right">Already Received</th>
                    <th className="p-2.5 text-right">Remaining</th>
                    <th className="p-2.5 text-right w-28">Receiving Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {receivingPO.items.map(it => {
                    const received = it.receivedQuantity || 0;
                    const remaining = it.quantity - received;

                    return (
                      <tr key={it.productId}>
                        <td className="p-2.5 font-medium text-text-primary">
                          {it.productName}
                          <span className="block text-[11px] font-mono text-text-secondary">{it.sku}</span>
                        </td>
                        <td className="p-2.5 text-right font-mono">{it.quantity}</td>
                        <td className="p-2.5 text-right font-mono text-text-secondary">{received}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-amber-600">{remaining}</td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            max={remaining}
                            value={receiveQuantities[it.productId] ?? remaining}
                            onChange={(e) => setReceiveQuantities({
                              ...receiveQuantities,
                              [it.productId]: e.target.value
                            })}
                            className="input-field text-xs py-1 text-right font-mono font-semibold"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Inspect PO Voucher Modal */}
      <Modal
        isOpen={Boolean(viewingPO)}
        onClose={() => setViewingPO(null)}
        title={`Purchase Order: ${viewingPO?.poNumber}`}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => { handleDownloadPDF(viewingPO); }}
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <Download size={14} /> Download PDF
            </button>
            <button onClick={() => setViewingPO(null)} className="btn-secondary btn-sm">Close</button>
          </div>
        }
      >
        {viewingPO && (
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-background-secondary/50 rounded-xl">
              <div>
                <span className="text-xs text-text-secondary block">Supplier</span>
                <span className="font-semibold text-text-primary">{viewingPO.supplierName}</span>
              </div>
              <div>
                <span className="text-xs text-text-secondary block">Destination Facility</span>
                <span className="font-semibold text-text-primary">
                  {warehouses.find(w => w.id === viewingPO.warehouseId)?.name}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-secondary block">Order Date</span>
                <span className="font-medium text-text-primary">{formatDate(viewingPO.orderDate)}</span>
              </div>
              <div>
                <span className="text-xs text-text-secondary block">Status</span>
                <StatusBadge status={viewingPO.status} />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-2">Ordered Inventory Manifest</h4>
              <div className="card overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-background-secondary/60 border-b border-border">
                    <tr className="text-left text-text-secondary">
                      <th className="p-3">Product Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3 text-right">Ordered</th>
                      <th className="p-3 text-right">Received</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewingPO.items.map(it => (
                      <tr key={it.productId}>
                        <td className="p-3 font-medium text-text-primary">{it.productName}</td>
                        <td className="p-3 font-mono text-text-secondary">{it.sku}</td>
                        <td className="p-3 text-right font-mono font-semibold">{it.quantity}</td>
                        <td className="p-3 text-right font-mono text-green-700 font-bold">{it.receivedQuantity || 0}</td>
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
                  <span className="font-mono">{formatCurrency(viewingPO.subtotal, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tax:</span>
                  <span className="font-mono">+{formatCurrency(viewingPO.taxAmount, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Discount:</span>
                  <span className="font-mono text-danger">-{formatCurrency(viewingPO.discountAmount, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                  <span>Grand Total:</span>
                  <span className="font-mono text-primary">{formatCurrency(viewingPO.grandTotal, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel PO Confirmation */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => { setIsCancelConfirmOpen(false); setCancellingPO(null); }}
        onConfirm={handleCancelPO}
        title="Cancel Purchase Order"
        message={`Are you sure you want to cancel purchase order "${cancellingPO?.poNumber}"?`}
        confirmText="Cancel Order"
        variant="danger"
      />
    </div>
  );
}
