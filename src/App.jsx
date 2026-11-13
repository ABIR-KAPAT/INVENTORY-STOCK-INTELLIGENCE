import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import AppLayout from './components/layout/AppLayout';
import { generateAllSeedData } from './data/seedData';
import { setMovements } from './store/slices/movementsSlice';
import { setPurchaseOrders } from './store/slices/purchaseOrdersSlice';
import { setSales } from './store/slices/salesSlice';
import { setAlerts } from './store/slices/alertsSlice';

// Lazy load pages
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import InventoryPage from './pages/InventoryPage';
import MovementsPage from './pages/MovementsPage';
import WarehousesPage from './pages/WarehousesPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

function DataInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // If movements or POs are empty, seed them
    const state = store.getState();
    if (state.movements.items.length === 0) {
      const seedData = generateAllSeedData();
      dispatch(setMovements(seedData.movements));
      dispatch(setPurchaseOrders(seedData.purchaseOrders));
      dispatch(setSales(seedData.sales));
    }
    // Generate alerts
    generateAlerts(dispatch, store.getState);
  }, [dispatch]);

  return children;
}

function generateAlerts(dispatch, getState) {
  const state = getState();
  const products = state.products.items;
  const purchaseOrders = state.purchaseOrders.items;
  const alerts = [];
  const now = new Date();

  products.forEach(product => {
    if (product.stock === 0) {
      alerts.push({
        type: 'out_of_stock', severity: 'critical',
        title: 'Out of Stock', productId: product.id,
        description: `${product.name} (${product.sku}) is out of stock.`,
        suggestedAction: 'Create a purchase order to restock this product.',
      });
    } else if (product.stock <= product.reorderPoint) {
      alerts.push({
        type: 'low_stock', severity: 'warning',
        title: 'Low Stock Alert', productId: product.id,
        description: `${product.name} (${product.sku}) has only ${product.stock} units remaining. Reorder point: ${product.reorderPoint}.`,
        suggestedAction: 'Consider placing a purchase order.',
      });
    }
    if (product.maxStock && product.stock > product.maxStock) {
      alerts.push({
        type: 'overstock', severity: 'info',
        title: 'Overstock Alert', productId: product.id,
        description: `${product.name} has ${product.stock} units, exceeding max stock of ${product.maxStock}.`,
        suggestedAction: 'Consider running a promotion or transferring stock.',
      });
    }
    if (product.expiryDate) {
      const expiry = new Date(product.expiryDate);
      const daysToExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (daysToExpiry <= 30 && daysToExpiry > 0) {
        alerts.push({
          type: 'expiring', severity: 'warning',
          title: 'Product Expiring Soon', productId: product.id,
          description: `${product.name} expires in ${daysToExpiry} days.`,
          suggestedAction: 'Prioritize selling this product or plan for disposal.',
        });
      }
    }
  });

  purchaseOrders.filter(po => ['sent', 'partially_received'].includes(po.status)).forEach(po => {
    const expected = new Date(po.expectedDate);
    if (expected < now) {
      alerts.push({
        type: 'delayed_po', severity: 'warning',
        title: 'Delayed Purchase Order', poId: po.id,
        description: `PO ${po.poNumber} from ${po.supplierName} is overdue.`,
        suggestedAction: 'Follow up with the supplier.',
      });
    }
  });

  dispatch(setAlerts(alerts));
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <DataInitializer>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
              error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="movements" element={<MovementsPage />} />
              <Route path="warehouses" element={<WarehousesPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="purchases" element={<PurchaseOrdersPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </DataInitializer>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
