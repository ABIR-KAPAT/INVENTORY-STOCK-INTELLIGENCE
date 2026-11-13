import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Plus, Search, Edit3, Trash2, Mail, Phone,
  Building2, MapPin, DollarSign, Package, ClipboardList,
  Eye, Download, ArrowRight, CheckCircle2, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

import { selectAllSuppliers, addSupplier, updateSupplier, deleteSupplier } from '../store/slices/suppliersSlice';
import { selectAllProducts } from '../store/slices/productsSlice';
import { selectAllPurchaseOrders } from '../store/slices/purchaseOrdersSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import { formatCurrency, formatDate, paginate, downloadCSV } from '../utils/helpers';

export default function SuppliersPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const suppliers = useSelector(selectAllSuppliers);
  const products = useSelector(selectAllProducts);
  const purchaseOrders = useSelector(selectAllPurchaseOrders);
  const settings = useSelector(selectSettings);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [selectedDetailSupplier, setSelectedDetailSupplier] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    contactPerson: '',
    paymentTerms: 'Net 30',
    status: 'active',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Compute stats per supplier
  const supplierStats = useMemo(() => {
    return suppliers.map(sup => {
      const suppliedProds = products.filter(p => p.supplierId === sup.id);
      const pos = purchaseOrders.filter(po => po.supplierId === sup.id);
      const totalPurchaseValue = pos.reduce((sum, po) => sum + po.grandTotal, 0);
      const outstandingPOs = pos.filter(po => ['draft', 'sent', 'partially_received'].includes(po.status));

      return {
        ...sup,
        suppliedCount: suppliedProds.length,
        poCount: pos.length,
        totalPurchaseValue,
        outstandingCount: outstandingPOs.length,
        products: suppliedProds,
        purchaseOrders: pos,
      };
    });
  }, [suppliers, products, purchaseOrders]);

  // Filtered
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery) return supplierStats;
    const q = searchQuery.toLowerCase();
    return supplierStats.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  }, [supplierStats, searchQuery]);

  const paginatedResult = useMemo(() => {
    return paginate(filteredSuppliers, currentPage, perPage);
  }, [filteredSuppliers, currentPage, perPage]);

  // Open Form
  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      company: sup.company || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || '',
      city: sup.city || '',
      contactPerson: sup.contactPerson || '',
      paymentTerms: sup.paymentTerms || 'Net 30',
      status: sup.status || 'active',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Supplier name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingSupplier) {
      dispatch(updateSupplier({ id: editingSupplier.id, ...formData }));
      toast.success(`Updated "${formData.name}"`);
    } else {
      dispatch(addSupplier(formData));
      toast.success(`Supplier "${formData.name}" added`);
    }
    setIsFormOpen(false);
  };

  // Delete Validation
  const confirmDelete = () => {
    if (deletingSupplier) {
      const activePOs = purchaseOrders.filter(
        po => po.supplierId === deletingSupplier.id &&
        ['draft', 'sent', 'partially_received'].includes(po.status)
      );
      if (activePOs.length > 0) {
        toast.error(`Cannot delete supplier with ${activePOs.length} active/pending purchase orders.`);
        setIsDeleteOpen(false);
        return;
      }

      dispatch(deleteSupplier(deletingSupplier.id));
      toast.success(`Supplier "${deletingSupplier.name}" removed`);
      setDeletingSupplier(null);
      setIsDeleteOpen(false);
    }
  };

  // Export Suppliers
  const handleExportCSV = () => {
    const csvData = suppliers.map(s => ({
      ID: s.id,
      Name: s.name,
      Company: s.company,
      Email: s.email,
      Phone: s.phone,
      City: s.city,
      Address: s.address,
      ContactPerson: s.contactPerson,
      PaymentTerms: s.paymentTerms,
      Status: s.status,
    }));
    downloadCSV(csvData, `suppliers_directory_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Supplier directory exported');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Directory"
        subtitle="Vendor relationships, procurement terms, PO histories & fulfillment records"
      >
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary btn-sm flex items-center gap-1.5">
            <Download size={15} />
            <span className="hidden sm:inline">Export Directory</span>
          </button>
          <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={16} />
            <span>New Supplier</span>
          </button>
        </div>
      </PageHeader>

      {/* Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by vendor name, company, email..."
            className="input-field pl-9"
          />
        </div>

        <div className="text-xs text-text-secondary">
          Active Vendors: <strong className="text-text-primary">{suppliers.length}</strong>
        </div>
      </div>

      {/* Supplier Grid */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No suppliers found"
          description="Register a new procurement supplier to link products and purchase orders."
          action={handleOpenAdd}
          actionLabel="Add Supplier"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedResult.items.map(sup => (
            <div key={sup.id} className="card p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-blue-50 text-primary rounded-xl flex-shrink-0">
                      <Truck size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text-primary truncate" title={sup.name}>
                        {sup.name}
                      </h3>
                      <p className="text-xs text-text-secondary truncate">{sup.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEdit(sup)}
                      className="p-1 rounded hover:bg-background-secondary text-text-secondary hover:text-primary"
                      title="Edit Supplier"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => { setDeletingSupplier(sup); setIsDeleteOpen(true); }}
                      className="p-1 rounded hover:bg-background-secondary text-text-secondary hover:text-danger"
                      title="Delete Supplier"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-text-tertiary flex-shrink-0" />
                    <span className="truncate">{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-text-tertiary flex-shrink-0" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-text-tertiary flex-shrink-0" />
                    <span className="truncate">{sup.address}, {sup.city}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span>Contact: <strong className="text-text-primary">{sup.contactPerson}</strong></span>
                    <span className="bg-primary-50 text-primary font-medium px-2 py-0.5 rounded text-[11px]">
                      {sup.paymentTerms}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border text-xs text-center">
                  <div className="bg-background-secondary/50 p-2 rounded-lg">
                    <span className="text-text-tertiary block text-[10px]">Products</span>
                    <span className="text-sm font-bold text-text-primary">{sup.suppliedCount}</span>
                  </div>
                  <div className="bg-background-secondary/50 p-2 rounded-lg">
                    <span className="text-text-tertiary block text-[10px]">Total POs</span>
                    <span className="text-sm font-bold text-text-primary">{sup.poCount}</span>
                  </div>
                  <div className="bg-background-secondary/50 p-2 rounded-lg">
                    <span className="text-text-tertiary block text-[10px]">Pending</span>
                    <span className="text-sm font-bold text-amber-600">{sup.outstandingCount}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setSelectedDetailSupplier(sup)}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <Eye size={13} />
                  <span>Vendor Profile</span>
                </button>

                <button
                  onClick={() => navigate(`/purchases?supplier=${sup.id}`)}
                  className="btn-secondary btn-sm text-xs py-1 px-2.5"
                >
                  View POs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={paginatedResult.totalPages}
        totalItems={filteredSuppliers.length}
        perPage={perPage}
        onPageChange={setCurrentPage}
      />

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Register New Vendor'}
        size="md"
        footer={
          <>
            <button onClick={() => setIsFormOpen(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary btn-sm">
              {editingSupplier ? 'Save Changes' : 'Register Vendor'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Supplier / Trade Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. TechVision Electronics"
                className={`input-field ${formErrors.name ? 'border-danger' : ''}`}
              />
              {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="label-text">Registered Legal Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. TechVision Pvt. Ltd."
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Official Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="orders@vendor.com"
                className={`input-field ${formErrors.email ? 'border-danger' : ''}`}
              />
              {formErrors.email && <p className="text-xs text-danger mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="label-text">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 22 4567 8901"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Key Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Vikram Mehta"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="select-field"
              >
                <option value="Net 7">Net 7 Days</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Immediate">Immediate / Advance</option>
              </select>
            </div>

            <div>
              <label className="label-text">Operating City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Operational Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select-field"
              >
                <option value="active">Active Vendor</option>
                <option value="inactive">Suspended / Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="label-text">Registered Office Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="101 Tech Park, Andheri East"
                className="input-field"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingSupplier(null); }}
        onConfirm={confirmDelete}
        title="Delete Supplier"
        message={`Are you sure you want to remove "${deletingSupplier?.name}"? You cannot delete suppliers with open purchase orders.`}
        confirmText="Delete Supplier"
        variant="danger"
      />

      {/* Supplier Profile / Details Drawer Modal */}
      <Modal
        isOpen={Boolean(selectedDetailSupplier)}
        onClose={() => setSelectedDetailSupplier(null)}
        title={`Supplier Profile: ${selectedDetailSupplier?.name}`}
        size="lg"
        footer={
          <button onClick={() => setSelectedDetailSupplier(null)} className="btn-secondary btn-sm">Close</button>
        }
      >
        {selectedDetailSupplier && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="card p-3">
                <span className="text-text-secondary block">Total Orders</span>
                <span className="text-lg font-bold text-text-primary">{selectedDetailSupplier.poCount}</span>
              </div>
              <div className="card p-3">
                <span className="text-text-secondary block">Total Procurement</span>
                <span className="text-lg font-bold text-text-primary font-mono truncate block">
                  {formatCurrency(selectedDetailSupplier.totalPurchaseValue, settings.currencySymbol)}
                </span>
              </div>
              <div className="card p-3">
                <span className="text-text-secondary block">Supplied SKUs</span>
                <span className="text-lg font-bold text-text-primary">{selectedDetailSupplier.suppliedCount}</span>
              </div>
              <div className="card p-3">
                <span className="text-text-secondary block">Payment Terms</span>
                <span className="text-lg font-bold text-primary">{selectedDetailSupplier.paymentTerms}</span>
              </div>
            </div>

            {/* Supplied Products Table */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                <Package size={16} className="text-primary" />
                Supplied Catalog Products ({selectedDetailSupplier.products.length})
              </h4>
              <div className="max-h-48 overflow-y-auto card">
                <table className="w-full text-xs">
                  <thead className="bg-background-secondary/50 border-b border-border">
                    <tr className="text-left text-text-secondary">
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5 text-right">Cost Price</th>
                      <th className="p-2.5 text-right">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedDetailSupplier.products.map(p => (
                      <tr key={p.id}>
                        <td className="p-2.5 font-medium text-text-primary">{p.name}</td>
                        <td className="p-2.5 font-mono text-text-secondary">{p.sku}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(p.costPrice, settings.currencySymbol)}</td>
                        <td className="p-2.5 text-right font-semibold">{p.stock} {p.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Purchase Orders */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                <ClipboardList size={16} className="text-primary" />
                Purchase Order History ({selectedDetailSupplier.purchaseOrders.length})
              </h4>
              <div className="max-h-48 overflow-y-auto card">
                <table className="w-full text-xs">
                  <thead className="bg-background-secondary/50 border-b border-border">
                    <tr className="text-left text-text-secondary">
                      <th className="p-2.5">PO Number</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5 text-right">Grand Total</th>
                      <th className="p-2.5 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedDetailSupplier.purchaseOrders.map(po => (
                      <tr key={po.id}>
                        <td className="p-2.5 font-mono font-medium text-text-primary">{po.poNumber}</td>
                        <td className="p-2.5 text-text-secondary">{formatDate(po.orderDate)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-text-primary">
                          {formatCurrency(po.grandTotal, settings.currencySymbol)}
                        </td>
                        <td className="p-2.5">
                          <StatusBadge status={po.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
