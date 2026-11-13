import { createSlice } from '@reduxjs/toolkit';
import { generateId } from '../../utils/helpers';

const initialState = {
  items: [],
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSales: (state, action) => {
      state.items = action.payload;
    },
    addSale: (state, action) => {
      state.items.unshift({
        ...action.payload,
        id: generateId('sale-'),
        createdAt: new Date().toISOString(),
      });
    },
    updateSale: (state, action) => {
      const idx = state.items.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    returnSale: (state, action) => {
      const sale = state.items.find(s => s.id === action.payload);
      if (sale) {
        sale.status = 'returned';
      }
    },
    deleteSale: (state, action) => {
      state.items = state.items.filter(s => s.id !== action.payload);
    },
    resetSales: (state) => {
      state.items = [];
    },
  },
});

export const { setSales, addSale, updateSale, returnSale, deleteSale, resetSales } = salesSlice.actions;
export const selectAllSales = (state) => state.sales.items;
export const selectSaleById = (id) => (state) => state.sales.items.find(s => s.id === id);
export const selectTotalRevenue = (state) => state.sales.items.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.grandTotal, 0);
export const selectTotalCOGS = (state) => state.sales.items.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.items.reduce((is, i) => is + (i.costPrice * i.quantity), 0), 0);
export default salesSlice.reducer;
