import { createSlice } from '@reduxjs/toolkit';
import { generateId } from '../../utils/helpers';

const initialState = {
  items: [],
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setAlerts: (state, action) => {
      state.items = action.payload;
    },
    addAlert: (state, action) => {
      state.items.unshift({
        ...action.payload,
        id: action.payload.id || generateId('alert-'),
        read: false,
        dismissed: false,
        createdAt: new Date().toISOString(),
      });
    },
    markAlertRead: (state, action) => {
      const alert = state.items.find(a => a.id === action.payload);
      if (alert) alert.read = true;
    },
    markAllRead: (state) => {
      state.items.forEach(a => { a.read = true; });
    },
    dismissAlert: (state, action) => {
      state.items = state.items.filter(a => a.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.items = [];
    },
  },
});

export const { setAlerts, addAlert, markAlertRead, markAllRead, dismissAlert, clearAlerts } = alertsSlice.actions;
export const selectAllAlerts = (state) => state.alerts.items;
export const selectUnreadAlerts = (state) => state.alerts.items.filter(a => !a.read);
export const selectAlertsByType = (type) => (state) => state.alerts.items.filter(a => a.type === type);
export default alertsSlice.reducer;
