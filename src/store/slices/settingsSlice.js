import { createSlice } from '@reduxjs/toolkit';

const defaultSettings = {
  businessName: 'StockWise Inventory Solutions',
  currency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'dd/MM/yyyy',
  lowStockThreshold: 1.0,
  expiryWarningDays: 30,
  theme: 'light',
  notifications: {
    lowStock: true,
    outOfStock: true,
    overstock: true,
    expiring: true,
    delayedPO: true,
  },
};

const initialState = defaultSettings;

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateNotificationPrefs: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    resetSettings: () => {
      return defaultSettings;
    },
  },
});

export const { updateSettings, updateNotificationPrefs, resetSettings } = settingsSlice.actions;
export const selectSettings = (state) => state.settings;
export const selectCurrency = (state) => ({ symbol: state.settings.currencySymbol, code: state.settings.currency });
export default settingsSlice.reducer;
