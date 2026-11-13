import { createSlice } from '@reduxjs/toolkit';
import { generateId } from '../../utils/helpers';

const initialState = {
  items: [],
};

const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {
    setPurchaseOrders: (state, action) => {
      state.items = action.payload;
    },
    addPurchaseOrder: (state, action) => {
      state.items.unshift({
        ...action.payload,
        id: generateId('po-'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    updatePurchaseOrder: (state, action) => {
      const idx = state.items.findIndex(po => po.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload, updatedAt: new Date().toISOString() };
      }
    },
    updatePOStatus: (state, action) => {
      const { id, status } = action.payload;
      const po = state.items.find(p => p.id === id);
      if (po) {
        po.status = status;
        po.updatedAt = new Date().toISOString();
      }
    },
    receivePOItems: (state, action) => {
      const { poId, receivedItems } = action.payload;
      const po = state.items.find(p => p.id === poId);
      if (po) {
        receivedItems.forEach(({ productId, quantity }) => {
          const item = po.items.find(i => i.productId === productId);
          if (item) {
            item.receivedQuantity = (item.receivedQuantity || 0) + quantity;
          }
        });
        const allReceived = po.items.every(i => i.receivedQuantity >= i.quantity);
        const someReceived = po.items.some(i => (i.receivedQuantity || 0) > 0);
        po.status = allReceived ? 'received' : someReceived ? 'partially_received' : po.status;
        po.updatedAt = new Date().toISOString();
      }
    },
    deletePurchaseOrder: (state, action) => {
      state.items = state.items.filter(po => po.id !== action.payload);
    },
    resetPurchaseOrders: (state) => {
      state.items = [];
    },
  },
});

export const {
  setPurchaseOrders, addPurchaseOrder, updatePurchaseOrder,
  updatePOStatus, receivePOItems, deletePurchaseOrder, resetPurchaseOrders
} = purchaseOrdersSlice.actions;

export const selectAllPurchaseOrders = (state) => state.purchaseOrders.items;
export const selectPOById = (id) => (state) => state.purchaseOrders.items.find(po => po.id === id);
export const selectPOsByStatus = (status) => (state) => state.purchaseOrders.items.filter(po => po.status === status);
export const selectPOsBySupplier = (supId) => (state) => state.purchaseOrders.items.filter(po => po.supplierId === supId);
export const selectPendingPOCount = (state) => state.purchaseOrders.items.filter(po => ['draft', 'sent', 'partially_received'].includes(po.status)).length;
export default purchaseOrdersSlice.reducer;
