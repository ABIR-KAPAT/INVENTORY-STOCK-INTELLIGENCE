import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import inventoryReducer from './slices/inventorySlice';
import movementsReducer from './slices/movementsSlice';
import warehousesReducer from './slices/warehousesSlice';
import suppliersReducer from './slices/suppliersSlice';
import purchaseOrdersReducer from './slices/purchaseOrdersSlice';
import salesReducer from './slices/salesSlice';
import alertsReducer from './slices/alertsSlice';
import settingsReducer from './slices/settingsSlice';
import { loadState, debouncedSaveState } from './persistence';

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    inventory: inventoryReducer,
    movements: movementsReducer,
    warehouses: warehousesReducer,
    suppliers: suppliersReducer,
    purchaseOrders: purchaseOrdersReducer,
    sales: salesReducer,
    alerts: alertsReducer,
    settings: settingsReducer,
  },
  preloadedState,
});

// Subscribe to store changes and persist
store.subscribe(() => {
  debouncedSaveState(store.getState());
});

export default store;
