import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Boxes, Plus, Minus, ArrowLeftRight, Lock, Unlock,
  Sliders, Search, Filter, AlertTriangle, CheckCircle2,
  Package, Warehouse, RefreshCw, Eye, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';

import { selectAllProducts, updateStock, updateProduct } from '../store/slices/productsSlice';
import { selectAllWarehouses } from '../store/slices/warehousesSlice';
import { selectAllCategories } from '../store/slices/categoriesSlice';
import { addMovement } from '../store/slices/movementsSlice';
import { selectReservations, reserveStock, releaseStock } from '../store/slices/inventorySlice';
import { selectAllPurchaseOrders } from '../store/slices/purchaseOrdersSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import {
  formatCurrency, formatNumber, formatDate,
  paginate, sortItems, generateId
} from '../utils/helpers';

export default function InventoryPage() {
  const dispatch = useDispatch();

  const products = useSelector(selectAllProducts);
  const warehouses = useSelector(selectAllWarehouses);
  const categories = useSelector(selectAllCategories);
  const reservations = useSelector(selectReservations);
  const purchaseOrders = useSelector(selectAllPurchaseOrders);
  const settings = useSelector(selectSettings);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedHealth, setSelectedHealth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Operation Modal State
  // modalType: 'in' | 'out' | 'adjust' | 'transfer' | 'reserve' | 'release' | null
  const [modalType, setModalType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form Fields
  const [opQuantity, setOpQuantity] = useState(1);
  const [targetWarehouseId, setTargetWarehouseId] = useState('');
  const [opReference, setOpReference] = useState('');
  const [opNotes, setOpNotes] = useState('');

  // Calculate incoming PO quantities per product
  const incomingMap = useMemo(() => {
    const map = {};
    purchaseOrders.forEach(po => {
      if (['sent', 'partially_received'].includes(po.status)) {
        po.items.forEach(it => {
          const remaining = it.quantity - (it.receivedQuantity || 0);
          if (remaining > 0) {
            map[it.productId] = (map[it.productId] || 0) + remaining;
          }
        });
      }
    });
    return map;
  }, [purchaseOrders]);

  // Combined inventory data rows
  const inventoryList = useMemo(() => {
    return products.map(p => {
      const reserved = reservations[p.id] || 0;
      const incoming = incomingMap[p.id] || 0;
      const available = Math.max(0, p.stock - reserved);

      let health = 'healthy';
      if (p.stock === 0) health = 'out_of_stock';
      else if (p.stock <= p.reorderPoint) health = 'low_stock';
      else if (p.maxStock && p.stock > p.maxStock) health = 'overstock';

      return {
        ...p,
        reserved,
        incoming,
        available,
        health,
      };
    });
  }, [products, reservations, incomingMap]);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventoryList.filter(item => {
      const matchSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchWh = !selectedWarehouse || item.warehouseId === selectedWarehouse;
      const matchHealth = !selectedHealth || item.health === selectedHealth;

      return matchSearch && matchWh && matchHealth;
    });
  }, [inventoryList, searchQuery, selectedWarehouse, selectedHealth]);

  const paginatedResult = useMemo(() => {
    return paginate(filteredInventory, currentPage, perPage);
  }, [filteredInventory, currentPage, perPage]);

  // Open Operations
  const openOperation = (type, product) => {
    setModalType(type);
    setSelectedProduct(product);
    setOpQuantity(type === 'adjust' ? product.stock : 1);
    setTargetWarehouseId(warehouses.find(w => w.id !== product.warehouseId)?.id || '');
    setOpReference(`REF-${Date.now().toString(36).toUpperCase()}`);
    setOpNotes('');
  };

  const closeOperation = () => {
    setModalType(null);
    setSelectedProduct(null);
  };

  // Execute Stock Operations
  const handleExecuteOperation = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = Number(opQuantity);
    if (isNaN(qty) || qty <= 0) {
      if (modalType !== 'adjust' || qty < 0) {
        toast.error('Please specify a valid positive quantity');
        return;
      }
    }

    const now = new Date().toISOString();
    const curStock = selectedProduct.stock;

    if (modalType === 'in') {
      // Stock In
      const newStock = curStock + qty;
      dispatch(updateStock({ productId: selectedProduct.id, quantity: qty, operation: 'add' }));
      dispatch(addMovement({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        warehouseId: selectedProduct.warehouseId,
        type: 'purchase_received',
        quantity: qty,
        previousBalance: curStock,
        newBalance: newStock,
        reference: opReference || `IN-${Date.now().toString(36)}`,
        notes: opNotes || 'Manual stock intake',
        date: now,
      }));
      toast.success(`Added ${qty} units to ${selectedProduct.name}`);
    } else if (modalType === 'out') {
      // Stock Out
      if (qty > curStock) {
        toast.error(`Cannot dispatch ${qty} units. Current stock is only ${curStock}.`);
        return;
      }
      const newStock = curStock - qty;
      dispatch(updateStock({ productId: selectedProduct.id, quantity: qty, operation: 'subtract' }));
      dispatch(addMovement({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        warehouseId: selectedProduct.warehouseId,
        type: 'sales_issued',
        quantity: -qty,
        previousBalance: curStock,
        newBalance: newStock,
        reference: opReference || `OUT-${Date.now().toString(36)}`,
        notes: opNotes || 'Manual stock issue',
        date: now,
      }));
      toast.success(`Dispatched ${qty} units from ${selectedProduct.name}`);
    } else if (modalType === 'adjust') {
      // Stock Adjustment
      const difference = qty - curStock;
      dispatch(updateStock({ productId: selectedProduct.id, quantity: qty, operation: 'set' }));
      dispatch(addMovement({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        warehouseId: selectedProduct.warehouseId,
        type: 'stock_adjustment',
        quantity: difference,
        previousBalance: curStock,
        newBalance: qty,
        reference: opReference || `ADJ-${Date.now().toString(36)}`,
        notes: opNotes || `Audit adjustment: variance of ${difference >= 0 ? '+' : ''}${difference} units`,
        date: now,
      }));
      toast.success(`Stock adjusted to ${qty} units`);
    } else if (modalType === 'transfer') {
      // Warehouse Transfer
      if (qty > curStock) {
        toast.error(`Transfer quantity exceeds available stock (${curStock})`);
        return;
      }
      if (!targetWarehouseId || targetWarehouseId === selectedProduct.warehouseId) {
        toast.error('Select a valid destination warehouse different from source');
        return;
      }

      // Check if product exists in destination warehouse
      const sourceWh = warehouses.find(w => w.id === selectedProduct.warehouseId)?.name || 'Source';
      const destWh = warehouses.find(w => w.id === targetWarehouseId)?.name || 'Destination';

      // Deduct from source product
      const newSourceStock = curStock - qty;
      dispatch(updateStock({ productId: selectedProduct.id, quantity: qty, operation: 'subtract' }));

      // Find if matching SKU exists in destination warehouse
      const destProduct = products.find(p => p.sku === selectedProduct.sku && p.warehouseId === targetWarehouseId);
      if (destProduct) {
        dispatch(updateStock({ productId: destProduct.id, quantity: qty, operation: 'add' }));
      } else {
        // Re-assign or note warehouse transfer
        dispatch(updateProduct({ id: selectedProduct.id, warehouseId: targetWarehouseId }));
      }

      dispatch(addMovement({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        warehouseId: selectedProduct.warehouseId,
        type: 'warehouse_transfer',
        quantity: -qty,
        previousBalance: curStock,
        newBalance: newSourceStock,
        reference: opReference || `TRF-${Date.now().toString(36)}`,
        notes: `Transfer from ${sourceWh} to ${destWh}. Note: ${opNotes}`,
        date: now,
      }));

      toast.success(`Transferred ${qty} units from ${sourceWh} to ${destWh}`);
    } else if (modalType === 'reserve') {
      // Reserve stock
      if (qty > selectedProduct.available) {
        toast.error(`Cannot reserve ${qty} units. Only ${selectedProduct.available} unreserved.`);
        return;
      }
      dispatch(reserveStock({ productId: selectedProduct.id, quantity: qty }));
      dispatch(addMovement({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        warehouseId: selectedProduct.warehouseId,
        type: 'reserved',
        quantity: 0,
        previousBalance: curStock,
        newBalance: curStock,
        reference: opReference || `RSV-${Date.now().toString(36)}`,
        notes: `Reserved ${qty} units. Note: ${opNotes}`,
        date: now,
      }));
      toast.success(`Reserved ${qty} units for ${selectedProduct.name}`);
    } else if (modalType === 'release') {
      // Release reservation
      const curReserved = reservations[selectedProduct.id] || 0;
      if (qty > curReserved) {
        toast.error(`Cannot release ${qty} units. Current reservation is ${curReserved}.`);
        return;
      }
      dispatch(releaseStock({ productId: selectedProduct.id, quantity: qty }));
      dispatch(addMovement({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        warehouseId: selectedProduct.warehouseId,
        type: 'released',
        quantity: 0,
        previousBalance: curStock,
        newBalance: curStock,
        reference: opReference || `REL-${Date.now().toString(36)}`,
        notes: `Released ${qty} reserved units. Note: ${opNotes}`,
        date: now,
      }));
      toast.success(`Released ${qty} reserved units`);
    }

    closeOperation();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Inventory Control"
        subtitle="Operational stock balancing, reservations, inter-warehouse transfers & variances"
      />

      {/* Top Controls & Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Filter inventory by SKU or product name..."
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedWarehouse}
              onChange={(e) => { setSelectedWarehouse(e.target.value); setCurrentPage(1); }}
              className="select-field text-xs py-2 w-44"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>

            <select
              value={selectedHealth}
              onChange={(e) => { setSelectedHealth(e.target.value); setCurrentPage(1); }}
              className="select-field text-xs py-2 w-36"
            >
              <option value="">All Health States</option>
              <option value="healthy">Healthy Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="overstock">Overstock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        {filteredInventory.length === 0 ? (
          <EmptyState
            title="No inventory records found"
            description="Clear search or filter criteria to see stock records."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-secondary/60 text-xs font-semibold text-text-secondary uppercase">
                  <th className="px-4 py-3.5 text-left">Product / SKU</th>
                  <th className="px-4 py-3.5 text-left">Warehouse</th>
                  <th className="px-4 py-3.5 text-right">Physical On-Hand</th>
                  <th className="px-4 py-3.5 text-right">Reserved</th>
                  <th className="px-4 py-3.5 text-right">Available</th>
                  <th className="px-4 py-3.5 text-right">Incoming PO</th>
                  <th className="px-4 py-3.5 text-right">Reorder Point</th>
                  <th className="px-4 py-3.5 text-left">Health Status</th>
                  <th className="px-4 py-3.5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedResult.items.map(item => {
                  const wh = warehouses.find(w => w.id === item.warehouseId);

                  return (
                    <tr key={item.id} className="hover:bg-background-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        <div className="truncate max-w-xs">{item.name}</div>
                        <span className="text-xs font-mono text-text-secondary">{item.sku}</span>
                      </td>

                      <td className="px-4 py-3 text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">{wh?.code}</span> - {wh?.city}
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-text-primary">
                        {item.stock} <span className="text-xs font-normal text-text-tertiary">{item.unit}</span>
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {item.reserved > 0 ? (
                          <span className="text-amber-600 font-semibold">{item.reserved}</span>
                        ) : (
                          <span className="text-text-tertiary">0</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-xs font-bold text-primary">
                        {item.available}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {item.incoming > 0 ? (
                          <span className="text-emerald-600 font-semibold">+{item.incoming}</span>
                        ) : (
                          <span className="text-text-tertiary">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                        {item.reorderPoint}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={item.health} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openOperation('in', item)}
                            className="p-1.5 rounded hover:bg-green-50 text-green-700 transition-colors"
                            title="Stock In (+)"
                          >
                            <Plus size={15} />
                          </button>

                          <button
                            onClick={() => openOperation('out', item)}
                            disabled={item.stock === 0}
                            className="p-1.5 rounded hover:bg-red-50 text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Stock Out (-)"
                          >
                            <Minus size={15} />
                          </button>

                          <button
                            onClick={() => openOperation('adjust', item)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-700 transition-colors"
                            title="Stock Adjustment"
                          >
                            <Sliders size={15} />
                          </button>

                          <button
                            onClick={() => openOperation('transfer', item)}
                            disabled={item.stock === 0}
                            className="p-1.5 rounded hover:bg-purple-50 text-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Transfer Warehouse"
                          >
                            <ArrowLeftRight size={15} />
                          </button>

                          <button
                            onClick={() => openOperation('reserve', item)}
                            disabled={item.available === 0}
                            className="p-1.5 rounded hover:bg-amber-50 text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Reserve Stock"
                          >
                            <Lock size={15} />
                          </button>

                          {item.reserved > 0 && (
                            <button
                              onClick={() => openOperation('release', item)}
                              className="p-1.5 rounded hover:bg-teal-50 text-teal-700 transition-colors"
                              title="Release Reservation"
                            >
                              <Unlock size={15} />
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
          totalItems={filteredInventory.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Stock Operation Modal */}
      <Modal
        isOpen={Boolean(modalType)}
        onClose={closeOperation}
        title={
          modalType === 'in' ? `Stock In: ${selectedProduct?.name}` :
          modalType === 'out' ? `Stock Out: ${selectedProduct?.name}` :
          modalType === 'adjust' ? `Stock Adjustment Audit: ${selectedProduct?.name}` :
          modalType === 'transfer' ? `Warehouse Transfer: ${selectedProduct?.name}` :
          modalType === 'reserve' ? `Reserve Inventory: ${selectedProduct?.name}` :
          modalType === 'release' ? `Release Reserved Inventory: ${selectedProduct?.name}` : ''
        }
        size="md"
        footer={
          <>
            <button onClick={closeOperation} className="btn-secondary btn-sm">Cancel</button>
            <button
              onClick={handleExecuteOperation}
              className={`btn-sm ${
                modalType === 'in' ? 'btn-primary' :
                modalType === 'out' ? 'btn-danger' :
                modalType === 'adjust' ? 'btn-primary' :
                modalType === 'transfer' ? 'btn-primary' : 'btn-primary'
              }`}
            >
              Confirm Operation
            </button>
          </>
        }
      >
        {selectedProduct && (
          <form onSubmit={handleExecuteOperation} className="space-y-4">
            {/* Context Summary banner */}
            <div className="bg-background-secondary/60 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">Current Physical Stock:</span>
                <span className="font-bold text-text-primary">{selectedProduct.stock} {selectedProduct.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Currently Reserved:</span>
                <span className="font-semibold text-amber-700">{selectedProduct.reserved} {selectedProduct.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Available for Dispatch:</span>
                <span className="font-bold text-primary">{selectedProduct.available} {selectedProduct.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Current Warehouse:</span>
                <span className="font-medium text-text-primary">
                  {warehouses.find(w => w.id === selectedProduct.warehouseId)?.name}
                </span>
              </div>
            </div>

            {/* Operation specific inputs */}
            {modalType === 'adjust' ? (
              <div>
                <label className="label-text">New Exact Stock Count *</label>
                <input
                  type="number"
                  min="0"
                  value={opQuantity}
                  onChange={(e) => setOpQuantity(e.target.value)}
                  className="input-field font-mono text-base font-semibold"
                />
                <span className="text-xs text-text-secondary mt-1 block">
                  Variance: {Number(opQuantity) - selectedProduct.stock >= 0 ? '+' : ''}
                  {Number(opQuantity) - selectedProduct.stock} {selectedProduct.unit}
                </span>
              </div>
            ) : (
              <div>
                <label className="label-text">
                  {modalType === 'in' ? 'Quantity to Add *' :
                   modalType === 'out' ? 'Quantity to Issue *' :
                   modalType === 'transfer' ? 'Quantity to Transfer *' :
                   modalType === 'reserve' ? 'Quantity to Reserve *' : 'Quantity to Release *'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={
                    modalType === 'out' ? selectedProduct.stock :
                    modalType === 'transfer' ? selectedProduct.stock :
                    modalType === 'reserve' ? selectedProduct.available :
                    modalType === 'release' ? selectedProduct.reserved : undefined
                  }
                  value={opQuantity}
                  onChange={(e) => setOpQuantity(e.target.value)}
                  className="input-field font-mono text-base font-semibold"
                />
              </div>
            )}

            {/* If transfer, select target warehouse */}
            {modalType === 'transfer' && (
              <div>
                <label className="label-text">Target Destination Warehouse *</label>
                <select
                  value={targetWarehouseId}
                  onChange={(e) => setTargetWarehouseId(e.target.value)}
                  className="select-field font-medium"
                >
                  <option value="">-- Choose Target Facility --</option>
                  {warehouses
                    .filter(w => w.id !== selectedProduct.warehouseId)
                    .map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="label-text">Transaction Reference / Voucher #</label>
              <input
                type="text"
                value={opReference}
                onChange={(e) => setOpReference(e.target.value)}
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="label-text">Reason / Audit Notes</label>
              <textarea
                rows={2}
                value={opNotes}
                onChange={(e) => setOpNotes(e.target.value)}
                placeholder="Audit explanation, invoice reference, damage report..."
                className="input-field resize-none text-xs"
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
