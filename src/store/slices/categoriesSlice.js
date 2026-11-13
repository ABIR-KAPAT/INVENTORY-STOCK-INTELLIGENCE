import { createSlice } from '@reduxjs/toolkit';
import { seedCategories } from '../../data/seedData';
import { generateId } from '../../utils/helpers';

const initialState = {
  items: seedCategories,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state, action) => {
      state.items.push({
        ...action.payload,
        id: generateId('cat-'),
        productCount: 0,
        createdAt: new Date().toISOString(),
      });
    },
    updateCategory: (state, action) => {
      const idx = state.items.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    deleteCategory: (state, action) => {
      state.items = state.items.filter(c => c.id !== action.payload);
    },
    resetCategories: (state) => {
      state.items = seedCategories;
    },
  },
});

export const { addCategory, updateCategory, deleteCategory, resetCategories } = categoriesSlice.actions;
export const selectAllCategories = (state) => state.categories.items;
export const selectCategoryById = (id) => (state) => state.categories.items.find(c => c.id === id);
export default categoriesSlice.reducer;
