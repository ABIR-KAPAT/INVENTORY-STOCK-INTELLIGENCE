import { createSlice } from '@reduxjs/toolkit';
import { seedSuppliers } from '../../data/seedData';
import { generateId } from '../../utils/helpers';

const initialState = {
  items: seedSuppliers,
};

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    addSupplier: (state, action) => {
      state.items.push({
        ...action.payload,
        id: generateId('sup-'),
        createdAt: new Date().toISOString(),
      });
    },
    updateSupplier: (state, action) => {
      const idx = state.items.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    deleteSupplier: (state, action) => {
      state.items = state.items.filter(s => s.id !== action.payload);
    },
    resetSuppliers: (state) => {
      state.items = seedSuppliers;
    },
  },
});

export const { addSupplier, updateSupplier, deleteSupplier, resetSuppliers } = suppliersSlice.actions;
export const selectAllSuppliers = (state) => state.suppliers.items;
export const selectSupplierById = (id) => (state) => state.suppliers.items.find(s => s.id === id);
export default suppliersSlice.reducer;
