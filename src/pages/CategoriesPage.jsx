import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit3, Trash2, Tag, Package, DollarSign,
  TrendingUp, Boxes, AlertCircle, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { selectAllCategories, addCategory, updateCategory, deleteCategory } from '../store/slices/categoriesSlice';
import { selectAllProducts, bulkUpdateCategory } from '../store/slices/productsSlice';
import { selectSettings } from '../store/slices/settingsSlice';
import { formatCurrency, formatNumber } from '../utils/helpers';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const categories = useSelector(selectAllCategories);
  const products = useSelector(selectAllProducts);
  const settings = useSelector(selectSettings);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Reassignment modal if products exist
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignTargetId, setReassignTargetId] = useState('');

  // Form State
  const initialForm = {
    name: '',
    description: '',
    color: '#2563EB',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Compute category statistics
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catProducts = products.filter(p => p.categoryId === cat.id);
      const productCount = catProducts.length;
      const totalUnits = catProducts.reduce((sum, p) => sum + p.stock, 0);
      const totalValue = catProducts.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
      const lowStockCount = catProducts.filter(p => p.stock > 0 && p.stock <= p.reorderPoint).length;
      const outOfStockCount = catProducts.filter(p => p.stock === 0).length;

      return {
        ...cat,
        productCount,
        totalUnits,
        totalValue,
        lowStockCount,
        outOfStockCount,
      };
    });
  }, [categories, products]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categoryStats;
    const q = searchQuery.toLowerCase();
    return categoryStats.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categoryStats, searchQuery]);

  // Open Add
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      color: cat.color || '#2563EB',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Category name is required';

    const duplicate = categories.find(
      c => c.name.toLowerCase() === formData.name.trim().toLowerCase() &&
           (!editingCategory || c.id !== editingCategory.id)
    );
    if (duplicate) errors.name = 'Category name already exists';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingCategory) {
      dispatch(updateCategory({ id: editingCategory.id, ...formData }));
      toast.success(`Category "${formData.name}" updated`);
    } else {
      dispatch(addCategory(formData));
      toast.success(`Category "${formData.name}" created`);
    }
    setIsFormOpen(false);
  };

  // Check delete safety
  const initiateDelete = (cat) => {
    const associatedProds = products.filter(p => p.categoryId === cat.id);
    if (associatedProds.length > 0) {
      // Must reassign first!
      setDeletingCategory(cat);
      setReassignTargetId('');
      setIsReassignModalOpen(true);
    } else {
      setDeletingCategory(cat);
      setIsDeleteOpen(true);
    }
  };

  const handleConfirmDirectDelete = () => {
    if (deletingCategory) {
      dispatch(deleteCategory(deletingCategory.id));
      toast.success(`Category "${deletingCategory.name}" deleted`);
      setDeletingCategory(null);
      setIsDeleteOpen(false);
    }
  };

  const handleReassignAndDelete = () => {
    if (!reassignTargetId) {
      toast.error('Select a destination category for existing products');
      return;
    }
    const associatedProds = products.filter(p => p.categoryId === deletingCategory.id);
    const prodIds = associatedProds.map(p => p.id);

    // Reassign products to the chosen target category
    dispatch(bulkUpdateCategory({ productIds: prodIds, categoryId: reassignTargetId }));
    // Now delete category
    dispatch(deleteCategory(deletingCategory.id));

    toast.success(`Reassigned ${prodIds.length} products and deleted "${deletingCategory.name}"`);
    setIsReassignModalOpen(false);
    setDeletingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Category Management"
        subtitle="Organize product catalog, track segment values and manage merchandise classifications"
      >
        <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5">
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </PageHeader>

      {/* Search & Summary Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="input-field pl-9"
          />
        </div>

        <div className="flex items-center gap-6 text-sm text-text-secondary w-full sm:w-auto justify-end">
          <div>
            Total Categories: <strong className="text-text-primary">{categories.length}</strong>
          </div>
          <div>
            Total Valuation: <strong className="text-text-primary">
              {formatCurrency(categoryStats.reduce((s, c) => s + c.totalValue, 0), settings.currencySymbol)}
            </strong>
          </div>
        </div>
      </div>

      {/* Category Cards Grid */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Create your first inventory category or adjust search terms."
          action={handleOpenAdd}
          actionLabel="Create Category"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCategories.map(cat => (
            <div
              key={cat.id}
              className="card p-5 hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              {/* Header color accent */}
              <div
                className="h-1.5 w-full rounded-t-xl absolute top-0 left-0"
                style={{ backgroundColor: cat.color }}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mt-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h3 className="font-semibold text-text-primary truncate" title={cat.name}>
                      {cat.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1 rounded hover:bg-background-secondary text-text-secondary hover:text-primary"
                      title="Edit Category"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => initiateDelete(cat)}
                      className="p-1 rounded hover:bg-background-secondary text-text-secondary hover:text-danger"
                      title="Delete Category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-text-secondary mt-2 line-clamp-2 min-h-[32px]">
                  {cat.description || 'No specific description provided for this classification.'}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border text-xs">
                  <div className="bg-background-secondary/50 p-2.5 rounded-lg">
                    <span className="text-text-tertiary block">SKUs Active</span>
                    <span className="text-sm font-bold text-text-primary">{formatNumber(cat.productCount)}</span>
                  </div>

                  <div className="bg-background-secondary/50 p-2.5 rounded-lg">
                    <span className="text-text-tertiary block">Units in Stock</span>
                    <span className="text-sm font-bold text-text-primary">{formatNumber(cat.totalUnits)}</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Total Value:</span>
                  <span className="font-semibold text-text-primary font-mono">
                    {formatCurrency(cat.totalValue, settings.currencySymbol)}
                  </span>
                </div>

                {/* Stock Health Indicators */}
                {(cat.lowStockCount > 0 || cat.outOfStockCount > 0) && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    {cat.lowStockCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {cat.lowStockCount} low
                      </span>
                    )}
                    {cat.outOfStockCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {cat.outOfStockCount} out
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* View Products button */}
              <button
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="mt-4 pt-2.5 border-t border-border text-xs font-medium text-primary hover:text-primary-dark flex items-center justify-between group"
              >
                <span>Browse Products</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
        size="sm"
        footer={
          <>
            <button onClick={() => setIsFormOpen(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary btn-sm">
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Industrial Automation"
              className={`input-field ${formErrors.name ? 'border-danger' : ''}`}
            />
            {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="label-text">Theme Color Badge</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-10 p-1 rounded-lg border border-border cursor-pointer bg-white"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="input-field font-mono text-xs w-28 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="label-text">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Specify merchandise group guidelines..."
              className="input-field resize-none text-sm"
            />
          </div>
        </form>
      </Modal>

      {/* Direct Delete Modal (no products) */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingCategory(null); }}
        onConfirm={handleConfirmDirectDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"?`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Mandatory Reassignment Modal (Products Attached) */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => { setIsReassignModalOpen(false); setDeletingCategory(null); }}
        title="Category Contains Products"
        size="md"
        footer={
          <>
            <button
              onClick={() => { setIsReassignModalOpen(false); setDeletingCategory(null); }}
              className="btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleReassignAndDelete}
              className="btn-danger btn-sm"
            >
              Reassign & Delete
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <strong className="block font-semibold">Cannot delete an active category with products</strong>
              Category <strong>"{deletingCategory?.name}"</strong> currently contains{' '}
              <strong>{products.filter(p => p.categoryId === deletingCategory?.id).length}</strong> associated products.
              Per enterprise data integrity rules, please choose a target category to safely migrate all products into before deletion.
            </div>
          </div>

          <div>
            <label className="label-text font-semibold">Migrate products to target category:</label>
            <select
              value={reassignTargetId}
              onChange={(e) => setReassignTargetId(e.target.value)}
              className="select-field"
            >
              <option value="">-- Select Destination Category --</option>
              {categories
                .filter(c => c.id !== deletingCategory?.id)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
