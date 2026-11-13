import { createSlice } from '@reduxjs/toolkit';
import { seedWarehouses } from '../../data/seedData';
import { generateId } from '../../utils/helpers';

const initialState = {
  items: seedWarehouses,
};

const warehousesSlice = createSlice({
  name: 'warehouses',
  initialState,
  reducers: {
    addWarehouse: (state, action) => {
      state.items.push({
        ...action.payload,
        id: generateId('wh-'),
        createdAt: new Date().toISOString(),
      });
    },
    updateWarehouse: (state, action) => {
      const idx = state.items.findIndex(w => w.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    deleteWarehouse: (state, action) => {
      state.items = state.items.filter(w => w.id !== action.payload);
    },
    resetWarehouses: (state) => {
      state.items = seedWarehouses;
    },
  },
});

export const { addWarehouse, updateWarehouse, deleteWarehouse, resetWarehouses } = warehousesSlice.actions;
export const selectAllWarehouses = (state) => state.warehouses.items;
export const selectWarehouseById = (id) => (state) => state.warehouses.items.find(w => w.id === id);
export default warehousesSlice.reducer;
