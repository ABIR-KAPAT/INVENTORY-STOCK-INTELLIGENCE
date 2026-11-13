import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reservations: {},
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    reserveStock: (state, action) => {
      const { productId, quantity } = action.payload;
      state.reservations[productId] = (state.reservations[productId] || 0) + quantity;
    },
    releaseStock: (state, action) => {
      const { productId, quantity } = action.payload;
      state.reservations[productId] = Math.max(0, (state.reservations[productId] || 0) - quantity);
    },
    resetInventory: (state) => {
      state.reservations = {};
    },
  },
});

export const { reserveStock, releaseStock, resetInventory } = inventorySlice.actions;
export const selectReservations = (state) => state.inventory.reservations;
export const selectReservedQuantity = (productId) => (state) => state.inventory.reservations[productId] || 0;
export default inventorySlice.reducer;
