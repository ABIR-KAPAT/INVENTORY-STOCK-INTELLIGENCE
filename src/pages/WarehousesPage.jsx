import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Warehouse, Plus, Edit3, Trash2, MapPin, User, Phone,
  Boxes, Package, DollarSign, ArrowRight, BarChart2,
  AlertTriangle, CheckCircle2, Building
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';

import { selectAllWarehouses, addWarehouse, updateWarehouse, deleteWarehouse } from '../store/slices/warehousesSlice';
import { selectAllProducts } from '../store/slices/productsSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import { formatCurrency, formatNumber } from '../utils/helpers';

export default function WarehousesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const warehouses = useSelector(selectAllWarehouses);
  const products = useSelector(selectAllProducts);
  const settings = useSelector(selectSettings);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingWh, setDeletingWh] = useState(null);

  // Selected warehouse stock drawer
  const [stockDrawerWh, setStockDrawerWh] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    code: '',
    address: '',
    city: '',
    manager: '',
    contact: '',
    status: 'active',
    capacity: 25000,
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Compute Warehouse Metrics
  const warehouseStats = useMemo(() => {
    return warehouses.map(wh => {
      const whProds = products.filter(p => p.warehouseId === wh.id);
      const totalUnits = whProds.reduce((sum, p) => sum + p.stock, 0);
      const totalValue = whProds.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
      const lowStockCount = whProds.filter(p => p.stock > 0 && p.stock <= p.reorderPoint).length;
      const outOfStockCount = whProds.filter(p => p.stock === 0).length;
      const capacity = wh.capacity || 30000;
      const utilization = Math.min(100, Math.round((totalUnits / capacity) * 100));

      return {
        ...wh,
        totalProducts: whProds.length,
        totalUnits,
        totalValue,
        lowStockCount,
        outOfStockCount,
        utilization,
        products: whProds,
      };
    });
  }, [warehouses, products]);

  // Comparison Chart Data
  const comparisonData = useMemo(() => {
    return warehouseStats.map(w => ({
      name: w.code,
      units: w.totalUnits,
      capacity: w.capacity,
      valueK: Math.round(w.totalValue / 1000),
    }));
  }, [warehouseStats]);

  // Open Add
  const handleOpenAdd = () => {
    setEditingWarehouse(null);
    setFormData({
      ...initialForm,
      code: `WH-0${warehouses.length + 1}`,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (wh) => {
    setEditingWarehouse(wh);
    setFormData({
      name: wh.name,
      code: wh.code,
      address: wh.address || '',
      city: wh.city || '',
      manager: wh.manager || '',
      contact: wh.contact || '',
      status: wh.status || 'active',
      capacity: wh.capacity || 25000,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Warehouse name is required';
    if (!formData.code.trim()) errors.code = 'Warehouse code is required';

    const duplicate = warehouses.find(
      w => w.code.toLowerCase() === formData.code.trim().toLowerCase() &&
           (!editingWarehouse || w.id !== editingWarehouse.id)
    );
    if (duplicate) errors.code = 'Warehouse code already in use';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      capacity: Number(formData.capacity) || 25000,
    };

    if (editingWarehouse) {
      dispatch(updateWarehouse({ id: editingWarehouse.id, ...payload }));
      toast.success(`Warehouse "${formData.name}" updated`);
    } else {
      dispatch(addWarehouse(payload));
      toast.success(`Warehouse "${formData.name}" added`);
    }
    setIsFormOpen(false);
  };

  // Delete
  const confirmDelete = () => {
    if (deletingWh) {
      const attached = products.filter(p => p.warehouseId === deletingWh.id);
      if (attached.length > 0) {
        toast.error(`Cannot delete warehouse holding ${attached.length} active products. Transfer stock first.`);
        setIsDeleteOpen(false);
        return;
      }
      dispatch(deleteWarehouse(deletingWh.id));
      toast.success(`Warehouse "${deletingWh.name}" deleted`);
      setDeletingWh(null);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-Warehouse Facilities"
        subtitle="Distribution hubs, storage capacity analytics & regional fulfillment centers"
      >
        <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5">
          <Plus size={16} />
          <span>Add Warehouse</span>
        </button>
      </PageHeader>

      {/* Comparison Chart Section */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Warehouse Performance & Capacity Benchmark</h3>
            <p className="text-xs text-text-secondary mt-0.5">Physical units stored vs Total designated holding capacity</p>
          </div>
          <span className="text-xs font-semibold text-primary bg-primary-50 px-2.5 py-1 rounded-full">
            {warehouses.length} Facilities Active
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Legend formatter={(val) => <span className="text-xs text-text-secondary capitalize">{val}</span>} />
              <Bar dataKey="units" name="Stocked Units" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capacity" name="Max Capacity" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouseStats.map(wh => (
          <div key={wh.id} className="card p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-primary-50 text-primary rounded-xl">
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{wh.name}</h3>
                    <span className="text-xs font-mono font-medium text-text-secondary">{wh.code} • {wh.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(wh)}
                    className="p-1 rounded hover:bg-background-secondary text-text-secondary hover:text-primary"
                    title="Edit Facility"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => { setDeletingWh(wh); setIsDeleteOpen(true); }}
                    className="p-1 rounded hover:bg-background-secondary text-text-secondary hover:text-danger"
                    title="Delete Facility"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Location & Contact info */}
              <div className="mt-3 space-y-1.5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-text-tertiary flex-shrink-0" />
                  <span className="truncate">{wh.address}, {wh.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={13} className="text-text-tertiary flex-shrink-0" />
                  <span>Manager: <strong className="text-text-primary font-medium">{wh.manager}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-text-tertiary flex-shrink-0" />
                  <span>{wh.contact}</span>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-medium">Capacity Utilization</span>
                  <span className={`font-bold ${wh.utilization >= 90 ? 'text-danger' : wh.utilization >= 70 ? 'text-amber-600' : 'text-primary'}`}>
                    {wh.utilization}%
                  </span>
                </div>
                <div className="w-full bg-background-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      wh.utilization >= 90 ? 'bg-danger' : wh.utilization >= 70 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${wh.utilization}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-text-tertiary mt-1 font-mono">
                  <span>{formatNumber(wh.totalUnits)} units</span>
                  <span>Max: {formatNumber(wh.capacity)} units</span>
                </div>
              </div>

              {/* Key Financial and Unit Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border text-xs">
                <div className="bg-background-secondary/50 p-2.5 rounded-lg">
                  <span className="text-text-tertiary block">SKUs Stored</span>
                  <span className="text-sm font-bold text-text-primary">{formatNumber(wh.totalProducts)}</span>
                </div>

                <div className="bg-background-secondary/50 p-2.5 rounded-lg">
                  <span className="text-text-tertiary block">Stock Valuation</span>
                  <span className="text-sm font-bold text-text-primary font-mono truncate block">
                    {formatCurrency(wh.totalValue, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setStockDrawerWh(wh)}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <span>Inspect Stock Inventory</span>
                <ArrowRight size={13} />
              </button>

              <button
                onClick={() => navigate(`/inventory?warehouse=${wh.id}`)}
                className="btn-secondary btn-sm text-xs py-1 px-2.5"
              >
                Stock Actions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Warehouse Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingWarehouse ? `Edit Warehouse: ${editingWarehouse.name}` : 'Register New Warehouse'}
        size="md"
        footer={
          <>
            <button onClick={() => setIsFormOpen(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary btn-sm">
              {editingWarehouse ? 'Save Changes' : 'Register Facility'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Warehouse Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. South Regional Hub"
                className={`input-field ${formErrors.name ? 'border-danger' : ''}`}
              />
              {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="label-text">Facility Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SRH-01"
                className={`input-field font-mono uppercase ${formErrors.code ? 'border-danger' : ''}`}
              />
              {formErrors.code && <p className="text-xs text-danger mt-1">{formErrors.code}</p>}
            </div>

            <div>
              <label className="label-text">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Bangalore"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Max Unit Capacity</label>
              <input
                type="number"
                min="1000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="label-text">Facility Manager</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="e.g. Arun Nair"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Contact Phone</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="input-field"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label-text">Full Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 88 Electronic City, Phase I"
                className="input-field"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Warehouse Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingWh(null); }}
        onConfirm={confirmDelete}
        title="Delete Warehouse Facility"
        message={`Are you sure you want to delete "${deletingWh?.name}"? You can only delete facilities with 0 stored stock.`}
        confirmText="Delete Facility"
        variant="danger"
      />

      {/* Stock Drawer Inspection Modal */}
      <Modal
        isOpen={Boolean(stockDrawerWh)}
        onClose={() => setStockDrawerWh(null)}
        title={`Stock Manifest: ${stockDrawerWh?.name} (${stockDrawerWh?.code})`}
        size="lg"
        footer={
          <button onClick={() => setStockDrawerWh(null)} className="btn-secondary btn-sm">Close</button>
        }
      >
        {stockDrawerWh && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-text-secondary bg-background-secondary/50 p-3 rounded-lg">
              <span>Total SKUs: <strong>{stockDrawerWh.products.length}</strong></span>
              <span>Total Units: <strong>{formatNumber(stockDrawerWh.totalUnits)}</strong></span>
              <span>Valuation: <strong>{formatCurrency(stockDrawerWh.totalValue, settings.currencySymbol)}</strong></span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left font-semibold text-text-secondary">
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2 text-right">Available</th>
                    <th className="pb-2 text-right">Cost Price</th>
                    <th className="pb-2 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stockDrawerWh.products.map(p => (
                    <tr key={p.id} className="hover:bg-background-secondary/30">
                      <td className="py-2 font-medium text-text-primary">{p.name}</td>
                      <td className="py-2 font-mono text-text-secondary">{p.sku}</td>
                      <td className="py-2 text-right font-semibold text-text-primary">{p.stock} {p.unit}</td>
                      <td className="py-2 text-right font-mono text-text-secondary">{formatCurrency(p.costPrice, settings.currencySymbol)}</td>
                      <td className="py-2 text-right font-mono font-medium text-text-primary">
                        {formatCurrency(p.stock * p.costPrice, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
