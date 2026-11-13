import { createSlice } from '@reduxjs/toolkit';
import { generateId } from '../../utils/helpers';

const initialState = {
  items: [],
};

const movementsSlice = createSlice({
  name: 'movements',
  initialState,
  reducers: {
    addMovement: (state, action) => {
      state.items.unshift({
        ...action.payload,
        id: action.payload.id || generateId('mov-'),
        createdAt: action.payload.createdAt || new Date().toISOString(),
      });
    },
    setMovements: (state, action) => {
      state.items = action.payload;
    },
    resetMovements: (state) => {
      state.items = [];
    },
  },
});

export const { addMovement, setMovements, resetMovements } = movementsSlice.actions;
export const selectAllMovements = (state) => state.movements.items;
export const selectMovementsByProduct = (productId) => (state) =>
  state.movements.items.filter(m => m.productId === productId);
export const selectMovementsByWarehouse = (warehouseId) => (state) =>
  state.movements.items.filter(m => m.warehouseId === warehouseId);
export default movementsSlice.reducer;
