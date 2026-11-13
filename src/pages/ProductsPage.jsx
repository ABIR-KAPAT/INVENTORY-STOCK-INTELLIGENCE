import React, { useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Plus, Search, Filter, Download, Upload, Trash2, Edit3,
  Eye, MoreVertical, CheckSquare, Layers, ArrowUpDown,
  AlertTriangle, RefreshCw, X, Check, Image as ImageIcon,
  DollarSign, Package, Tag, Warehouse, Truck, Columns
} from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';

import {
  selectAllProducts, addProduct, updateProduct, deleteProduct,
  bulkDeleteProducts, bulkUpdateCategory, importProducts
} from '../store/slices/productsSlice';
import { selectAllCategories } from '../store/slices/categoriesSlice';
import { selectAllWarehouses } from '../store/slices/warehousesSlice';
import { selectAllSuppliers } from '../store/slices/suppliersSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import {
  formatCurrency, formatDate, paginate, sortItems,
  calcMargin, downloadCSV, generateId
} from '../utils/helpers';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const products = useSelector(selectAllProducts);
  const categories = useSelector(selectAllCategories);
  const warehouses = useSelector(selectAllWarehouses);
  const suppliers = useSelector(selectAllSuppliers);
  const settings = useSelector(selectSettings);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');

  // Table sorting & pagination
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
  const [bulkTargetCategory, setBulkTargetCategory] = useState('');
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    name: true,
    sku: true,
    category: true,
    brand: true,
    costPrice: true,
    sellingPrice: true,
    stock: true,
    warehouse: true,
    status: true,
    actions: true,
  });

  // Form State
  const initialForm = {
    name: '',
    sku: '',
    barcode: '',
    description: '',
    brand: '',
    categoryId: categories[0]?.id || '',
    image: '',
    costPrice: 0,
    sellingPrice: 0,
    taxPercent: 18,
    stock: 0,
    minStock: 10,
    maxStock: 500,
    reorderPoint: 20,
    warehouseId: warehouses[0]?.id || '',
    supplierId: suppliers[0]?.id || '',
    supplierSku: '',
    unit: 'pcs',
    expiryDate: '',
    tags: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Reset form
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      categoryId: categories[0]?.id || '',
      warehouseId: warehouses[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      sku: prod.sku || '',
      barcode: prod.barcode || '',
      description: prod.description || '',
      brand: prod.brand || '',
      categoryId: prod.categoryId || categories[0]?.id || '',
      image: prod.image || '',
      costPrice: prod.costPrice || 0,
      sellingPrice: prod.sellingPrice || 0,
      taxPercent: prod.taxPercent || 18,
      stock: prod.stock || 0,
      minStock: prod.minStock || 0,
      maxStock: prod.maxStock || 100,
      reorderPoint: prod.reorderPoint || 10,
      warehouseId: prod.warehouseId || warehouses[0]?.id || '',
      supplierId: prod.supplierId || suppliers[0]?.id || '',
      supplierSku: prod.supplierSku || '',
      unit: prod.unit || 'pcs',
      expiryDate: prod.expiryDate ? prod.expiryDate.split('T')[0] : '',
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';

    // Duplicate SKU check
    const existing = products.find(
      p => p.sku.toLowerCase() === formData.sku.trim().toLowerCase() &&
           (!editingProduct || p.id !== editingProduct.id)
    );
    if (existing) {
      errors.sku = 'SKU already exists. Must be unique.';
    }

    if (Number(formData.costPrice) < 0) errors.costPrice = 'Cost price cannot be negative';
    if (Number(formData.sellingPrice) < 0) errors.sellingPrice = 'Selling price cannot be negative';
    if (Number(formData.stock) < 0) errors.stock = 'Stock cannot be negative';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve the validation errors');
      return;
    }

    const payload = {
      ...formData,
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      taxPercent: Number(formData.taxPercent),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      maxStock: Number(formData.maxStock),
      reorderPoint: Number(formData.reorderPoint),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    if (editingProduct) {
      dispatch(updateProduct({ id: editingProduct.id, ...payload }));
      toast.success(`Updated "${payload.name}" successfully`);
    } else {
      dispatch(addProduct(payload));
      toast.success(`Product "${payload.name}" added successfully`);
    }
    setIsFormOpen(false);
  };

  // Delete product
  const confirmDelete = () => {
    if (deletingId) {
      dispatch(deleteProduct(deletingId));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(deletingId);
        return next;
      });
      toast.success('Product removed');
      setDeletingId(null);
    }
  };

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(filteredProducts.map(p => p.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmBulkDelete = () => {
    dispatch(bulkDeleteProducts(Array.from(selectedIds)));
    toast.success(`Deleted ${selectedIds.size} products`);
    setSelectedIds(new Set());
    setIsBulkDeleteOpen(false);
  };

  const handleBulkCategory = () => {
    if (!bulkTargetCategory) {
      toast.error('Select a target category');
      return;
    }
    dispatch(bulkUpdateCategory({
      productIds: Array.from(selectedIds),
      categoryId: bulkTargetCategory
    }));
    toast.success(`Assigned category to ${selectedIds.size} products`);
    setSelectedIds(new Set());
    setIsBulkCategoryOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const exportData = filteredProducts.map(p => ({
      ID: p.id,
      Name: p.name,
      SKU: p.sku,
      Barcode: p.barcode,
      Category: categories.find(c => c.id === p.categoryId)?.name || '',
      Brand: p.brand,
      CostPrice: p.costPrice,
      SellingPrice: p.sellingPrice,
      Stock: p.stock,
      Unit: p.unit,
      Warehouse: warehouses.find(w => w.id === p.warehouseId)?.name || '',
      Supplier: suppliers.find(s => s.id === p.supplierId)?.name || '',
      Status: p.status,
      ReorderPoint: p.reorderPoint
    }));
    downloadCSV(exportData, `products_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Products exported to CSV');
  };

  // CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = [];
        let skipped = 0;
        const existingSkus = new Set(products.map(p => p.sku.toLowerCase()));

        results.data.forEach((row, i) => {
          const sku = row.SKU || row.sku || `IMP-${i + 1}`;
          if (existingSkus.has(sku.toLowerCase())) {
            skipped++;
            return;
          }
          existingSkus.add(sku.toLowerCase());

          parsed.push({
            name: row.Name || row.name || 'Imported Product',
            sku,
            barcode: row.Barcode || row.barcode || '',
            brand: row.Brand || row.brand || 'Generic',
            categoryId: categories[0]?.id || '',
            costPrice: parseFloat(row.CostPrice || row.costPrice || 0),
            sellingPrice: parseFloat(row.SellingPrice || row.sellingPrice || 0),
            stock: parseInt(row.Stock || row.stock || 0, 10),
            warehouseId: warehouses[0]?.id || '',
            supplierId: suppliers[0]?.id || '',
            unit: row.Unit || row.unit || 'pcs',
            reorderPoint: parseInt(row.ReorderPoint || row.reorderPoint || 10, 10),
            minStock: 5,
            maxStock: 200,
          });
        });

        if (parsed.length > 0) {
          dispatch(importProducts(parsed));
          toast.success(`Successfully imported ${parsed.length} products (${skipped} duplicates skipped)`);
        } else {
          toast.error('No valid new products found in CSV');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (err) => {
        toast.error('Failed to parse CSV file: ' + err.message);
      }
    });
  };

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      const matchesSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());

      // Filters
      const matchesCat = !selectedCategory || p.categoryId === selectedCategory;
      const matchesWh = !selectedWarehouse || p.warehouseId === selectedWarehouse;
      const matchesSup = !selectedSupplier || p.supplierId === selectedSupplier;
      const matchesStatus = !selectedStockStatus || p.status === selectedStockStatus;

      return matchesSearch && matchesCat && matchesWh && matchesSup && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedWarehouse, selectedSupplier, selectedStockStatus]);

  // Sorting
  const sortedProducts = useMemo(() => {
    return sortItems(filteredProducts, sortKey, sortDir);
  }, [filteredProducts, sortKey, sortDir]);

  // Pagination
  const paginatedResult = useMemo(() => {
    return paginate(sortedProducts, currentPage, perPage);
  }, [sortedProducts, currentPage, perPage]);

  // Handle Sort
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Calculated Profit Margin in modal
  const calculatedMargin = useMemo(() => {
    return calcMargin(formData.costPrice, formData.sellingPrice);
  }, [formData.costPrice, formData.sellingPrice]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Products Management"
        subtitle={`Total ${products.length} products across ${warehouses.length} warehouses`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input for CSV */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary btn-sm"
            title="Import CSV"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-secondary btn-sm"
            title="Export CSV"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by product name, SKU, brand..."
              className="input-field pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="select-field text-xs py-2 w-36"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedWarehouse}
              onChange={(e) => { setSelectedWarehouse(e.target.value); setCurrentPage(1); }}
              className="select-field text-xs py-2 w-36"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>

            <select
              value={selectedSupplier}
              onChange={(e) => { setSelectedSupplier(e.target.value); setCurrentPage(1); }}
              className="select-field text-xs py-2 w-36"
            >
              <option value="">All Suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedStockStatus}
              onChange={(e) => { setSelectedStockStatus(e.target.value); setCurrentPage(1); }}
              className="select-field text-xs py-2 w-32"
            >
              <option value="">All Statuses</option>
              <option value="active">Active / In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {/* Column Picker Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
                className="btn-secondary btn-sm p-2 text-text-secondary"
                title="Visible Columns"
              >
                <Columns size={16} />
              </button>

              {isColumnPickerOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsColumnPickerOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-lg shadow-xl p-3 z-40 text-xs space-y-2">
                    <p className="font-semibold text-text-primary pb-1 border-b border-border">Visible Columns</p>
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer capitalize">
                        <input
                          type="checkbox"
                          checked={visibleColumns[col]}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })}
                          className="rounded border-border"
                        />
                        <span>{col.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Selection Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-lg px-4 py-2 text-xs">
            <span className="font-medium text-primary">
              {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkCategoryOpen(true)}
                className="btn-secondary btn-sm text-xs py-1"
              >
                Change Category
              </button>
              <button
                onClick={() => setIsBulkDeleteOpen(true)}
                className="btn-danger btn-sm text-xs py-1"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-text-secondary hover:text-text-primary underline ml-2"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Products Table */}
      <div className="card overflow-hidden">
        {sortedProducts.length === 0 ? (
          <EmptyState
            title="No products match your criteria"
            description="Try modifying search keywords or clearing active filters."
            action={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedWarehouse('');
              setSelectedSupplier('');
              setSelectedStockStatus('');
            }}
            actionLabel="Reset Filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-secondary/60 text-xs font-semibold text-text-secondary uppercase">
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedResult.items.length && paginatedResult.items.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border"
                    />
                  </th>
                  {visibleColumns.image && <th className="px-4 py-3.5 w-14">Image</th>}
                  {visibleColumns.name && (
                    <th
                      className="px-4 py-3.5 text-left cursor-pointer hover:text-text-primary"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Product Name</span>
                        <ArrowUpDown size={12} className={sortKey === 'name' ? 'text-primary' : 'opacity-40'} />
                      </div>
                    </th>
                  )}
                  {visibleColumns.sku && (
                    <th
                      className="px-4 py-3.5 text-left cursor-pointer hover:text-text-primary"
                      onClick={() => handleSort('sku')}
                    >
                      <div className="flex items-center gap-1">
                        <span>SKU</span>
                        <ArrowUpDown size={12} className={sortKey === 'sku' ? 'text-primary' : 'opacity-40'} />
                      </div>
                    </th>
                  )}
                  {visibleColumns.category && <th className="px-4 py-3.5 text-left">Category</th>}
                  {visibleColumns.brand && <th className="px-4 py-3.5 text-left">Brand</th>}
                  {visibleColumns.costPrice && (
                    <th
                      className="px-4 py-3.5 text-right cursor-pointer hover:text-text-primary"
                      onClick={() => handleSort('costPrice')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Cost</span>
                        <ArrowUpDown size={12} className={sortKey === 'costPrice' ? 'text-primary' : 'opacity-40'} />
                      </div>
                    </th>
                  )}
                  {visibleColumns.sellingPrice && (
                    <th
                      className="px-4 py-3.5 text-right cursor-pointer hover:text-text-primary"
                      onClick={() => handleSort('sellingPrice')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Price</span>
                        <ArrowUpDown size={12} className={sortKey === 'sellingPrice' ? 'text-primary' : 'opacity-40'} />
                      </div>
                    </th>
                  )}
                  {visibleColumns.stock && (
                    <th
                      className="px-4 py-3.5 text-right cursor-pointer hover:text-text-primary"
                      onClick={() => handleSort('stock')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Stock</span>
                        <ArrowUpDown size={12} className={sortKey === 'stock' ? 'text-primary' : 'opacity-40'} />
                      </div>
                    </th>
                  )}
                  {visibleColumns.warehouse && <th className="px-4 py-3.5 text-left">Warehouse</th>}
                  {visibleColumns.status && <th className="px-4 py-3.5 text-left">Status</th>}
                  {visibleColumns.actions && <th className="px-4 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedResult.items.map(p => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  const wh = warehouses.find(w => w.id === p.warehouseId);
                  const isSelected = selectedIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-background-secondary/40 transition-colors ${isSelected ? 'bg-primary-50/40' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(p.id)}
                          className="rounded border-border"
                        />
                      </td>

                      {visibleColumns.image && (
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg bg-background-secondary flex items-center justify-center overflow-hidden border border-border">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={18} className="text-text-tertiary" />
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.name && (
                        <td className="px-4 py-3 font-medium text-text-primary">
                          <div className="max-w-xs truncate" title={p.name}>{p.name}</div>
                          {p.barcode && <div className="text-xs text-text-tertiary font-mono">Barcode: {p.barcode}</div>}
                        </td>
                      )}

                      {visibleColumns.sku && (
                        <td className="px-4 py-3 font-mono text-xs text-text-secondary">{p.sku}</td>
                      )}

                      {visibleColumns.category && (
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: `${cat?.color || '#64748B'}15`, color: cat?.color || '#64748B' }}
                          >
                            {cat?.name || 'Unassigned'}
                          </span>
                        </td>
                      )}

                      {visibleColumns.brand && (
                        <td className="px-4 py-3 text-text-secondary">{p.brand}</td>
                      )}

                      {visibleColumns.costPrice && (
                        <td className="px-4 py-3 text-right font-mono text-text-secondary">
                          {formatCurrency(p.costPrice, settings.currencySymbol)}
                        </td>
                      )}

                      {visibleColumns.sellingPrice && (
                        <td className="px-4 py-3 text-right font-mono font-medium text-text-primary">
                          {formatCurrency(p.sellingPrice, settings.currencySymbol)}
                        </td>
                      )}

                      {visibleColumns.stock && (
                        <td className="px-4 py-3 text-right font-medium">
                          <span className={p.stock === 0 ? 'text-danger font-bold' : p.stock <= p.reorderPoint ? 'text-amber-600 font-semibold' : 'text-text-primary'}>
                            {p.stock}
                          </span>
                          <span className="text-xs text-text-tertiary ml-1">{p.unit}</span>
                        </td>
                      )}

                      {visibleColumns.warehouse && (
                        <td className="px-4 py-3 text-text-secondary text-xs">{wh?.code || '-'}</td>
                      )}

                      {visibleColumns.status && (
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                      )}

                      {visibleColumns.actions && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded hover:bg-background-secondary text-text-secondary hover:text-primary transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => { setDeletingId(p.id); setIsDeleteOpen(true); }}
                              className="p-1.5 rounded hover:bg-background-secondary text-text-secondary hover:text-danger transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={paginatedResult.totalPages}
          totalItems={filteredProducts.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              className="btn-primary btn-sm"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmitForm} className="space-y-6">
          {/* Section 1: General Info */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ergonomic Keyboard"
                  className={`input-field ${formErrors.name ? 'border-danger' : ''}`}
                />
                {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="label-text">SKU (Unique Identifier) *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  placeholder="e.g. ELEC-099"
                  className={`input-field font-mono ${formErrors.sku ? 'border-danger' : ''}`}
                />
                {formErrors.sku && <p className="text-xs text-danger mt-1">{formErrors.sku}</p>}
              </div>

              <div>
                <label className="label-text">Brand / Manufacturer</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Logitech"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-text">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="select-field"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">Barcode (UPC / EAN)</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="e.g. 8901234567890"
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="label-text">Product Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-text">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, warranty information..."
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Margins */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pricing & Margins</h4>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${calculatedMargin >= 30 ? 'bg-green-100 text-green-700' : calculatedMargin > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                Profit Margin: {calculatedMargin}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-text">Cost / Purchase Price ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className={`input-field font-mono ${formErrors.costPrice ? 'border-danger' : ''}`}
                />
                {formErrors.costPrice && <p className="text-xs text-danger mt-1">{formErrors.costPrice}</p>}
              </div>

              <div>
                <label className="label-text">Selling Price ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className={`input-field font-mono ${formErrors.sellingPrice ? 'border-danger' : ''}`}
                />
                {formErrors.sellingPrice && <p className="text-xs text-danger mt-1">{formErrors.sellingPrice}</p>}
              </div>

              <div>
                <label className="label-text">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.taxPercent}
                  onChange={(e) => setFormData({ ...formData, taxPercent: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Inventory Levels & Warehouse */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Stock & Warehouse Control</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-text">Current Available Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className={`input-field font-mono ${formErrors.stock ? 'border-danger' : ''}`}
                />
                {formErrors.stock && <p className="text-xs text-danger mt-1">{formErrors.stock}</p>}
              </div>

              <div>
                <label className="label-text">Reorder Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="label-text">Unit of Measure</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="select-field"
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="boxes">Boxes</option>
                  <option value="sets">Sets</option>
                  <option value="packs">Packs</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="meters">Meters (m)</option>
                </select>
              </div>

              <div>
                <label className="label-text">Assigned Warehouse</label>
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
                <label className="label-text">Min Stock Safety Level</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="label-text">Max Storage Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Supplier Details */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Supplier & Expiry</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-text">Primary Supplier</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="select-field"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.company})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">Supplier Product SKU</label>
                <input
                  type="text"
                  value={formData.supplierSku}
                  onChange={(e) => setFormData({ ...formData, supplierSku: e.target.value })}
                  placeholder="e.g. SUP-REF-101"
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="label-text">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Single Product Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? All transaction history references will remain intact in movement ledgers."
        confirmText="Delete"
        variant="danger"
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedIds.size} Products`}
        message={`Are you sure you want to permanently delete ${selectedIds.size} selected products? This action cannot be undone.`}
        confirmText={`Delete ${selectedIds.size} Items`}
        variant="danger"
      />

      {/* Bulk Category Assign Modal */}
      <Modal
        isOpen={isBulkCategoryOpen}
        onClose={() => setIsBulkCategoryOpen(false)}
        title="Assign Category in Bulk"
        size="sm"
        footer={
          <>
            <button onClick={() => setIsBulkCategoryOpen(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={handleBulkCategory} className="btn-primary btn-sm">Apply Category</button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Select the new merchandise category to assign to all <strong>{selectedIds.size}</strong> selected items:
          </p>
          <select
            value={bulkTargetCategory}
            onChange={(e) => setBulkTargetCategory(e.target.value)}
            className="select-field"
          >
            <option value="">-- Choose Category --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}
