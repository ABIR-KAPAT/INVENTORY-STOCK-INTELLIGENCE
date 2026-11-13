import { createSlice } from '@reduxjs/toolkit';
import { generateProducts } from '../../data/seedData';
import { generateId, getStockStatus } from '../../utils/helpers';

const initialState = {
  items: generateProducts(),
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const product = {
        ...action.payload,
        id: generateId('prod-'),
        status: getStockStatus(action.payload.stock || 0, action.payload.reorderPoint || 0, action.payload.maxStock),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.items.push(product);
    },
    updateProduct: (state, action) => {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = {
          ...state.items[idx],
          ...action.payload,
          status: getStockStatus(
            action.payload.stock ?? state.items[idx].stock,
            action.payload.reorderPoint ?? state.items[idx].reorderPoint,
            action.payload.maxStock ?? state.items[idx].maxStock
          ),
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteProduct: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    bulkDeleteProducts: (state, action) => {
      const ids = new Set(action.payload);
      state.items = state.items.filter(p => !ids.has(p.id));
    },
    bulkUpdateCategory: (state, action) => {
      const { productIds, categoryId } = action.payload;
      const ids = new Set(productIds);
      state.items.forEach(p => {
        if (ids.has(p.id)) p.categoryId = categoryId;
      });
    },
    updateStock: (state, action) => {
      const { productId, quantity, operation } = action.payload;
      const product = state.items.find(p => p.id === productId);
      if (product) {
        if (operation === 'add') {
          product.stock += quantity;
        } else if (operation === 'subtract') {
          product.stock = Math.max(0, product.stock - quantity);
        } else if (operation === 'set') {
          product.stock = Math.max(0, quantity);
        }
        product.status = getStockStatus(product.stock, product.reorderPoint, product.maxStock);
        product.updatedAt = new Date().toISOString();
      }
    },
    importProducts: (state, action) => {
      const newProducts = action.payload.map(p => ({
        ...p,
        id: p.id || generateId('prod-'),
        status: getStockStatus(p.stock || 0, p.reorderPoint || 0, p.maxStock),
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      state.items.push(...newProducts);
    },
    resetProducts: (state) => {
      state.items = generateProducts();
    },
  },
});

export const {
  addProduct, updateProduct, deleteProduct, bulkDeleteProducts,
  bulkUpdateCategory, updateStock, importProducts, resetProducts
} = productsSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.items;
export const selectProductById = (id) => (state) => state.products.items.find(p => p.id === id);
export const selectProductBySku = (sku) => (state) => state.products.items.find(p => p.sku === sku);
export const selectProductsByCategory = (catId) => (state) => state.products.items.filter(p => p.categoryId === catId);
export const selectProductsByWarehouse = (whId) => (state) => state.products.items.filter(p => p.warehouseId === whId);
export const selectProductsBySupplier = (supId) => (state) => state.products.items.filter(p => p.supplierId === supId);
export const selectLowStockProducts = (state) => state.products.items.filter(p => p.stock > 0 && p.stock <= p.reorderPoint);
export const selectOutOfStockProducts = (state) => state.products.items.filter(p => p.stock === 0);
export const selectOverstockProducts = (state) => state.products.items.filter(p => p.maxStock && p.stock > p.maxStock);
export const selectTotalInventoryValue = (state) => state.products.items.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
export const selectTotalUnits = (state) => state.products.items.reduce((sum, p) => sum + p.stock, 0);
export const selectProductCount = (state) => state.products.items.length;

export default productsSlice.reducer;
