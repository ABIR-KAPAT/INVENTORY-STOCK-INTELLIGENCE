import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Settings as SettingsIcon, Building, DollarSign, Calendar,
  Bell, Shield, RefreshCw, Download, Upload, Check,
  RotateCcw, Sun, Moon, Info, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  selectSettings, updateSettings, updateNotificationPrefs, resetSettings
} from '../store/slices/settingsSlice';
import { resetProducts } from '../store/slices/productsSlice';
import { resetCategories } from '../store/slices/categoriesSlice';
import { resetWarehouses } from '../store/slices/warehousesSlice';
import { resetSuppliers } from '../store/slices/suppliersSlice';
import { setMovements } from '../store/slices/movementsSlice';
import { setPurchaseOrders } from '../store/slices/purchaseOrdersSlice';
import { setSales } from '../store/slices/salesSlice';
import { clearAlerts } from '../store/slices/alertsSlice';
import { generateAllSeedData } from '../data/seedData';
import { clearState } from '../store/persistence';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);

  const [businessName, setBusinessName] = useState(settings.businessName || 'StockWise Inventory Solutions');
  const [currency, setCurrency] = useState(settings.currency || 'INR');
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'dd/MM/yyyy');
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold || 1.0);
  const [expiryWarningDays, setExpiryWarningDays] = useState(settings.expiryWarningDays || 30);
  const [theme, setTheme] = useState(settings.theme || 'light');

  const [notifications, setNotifications] = useState({
    lowStock: settings.notifications?.lowStock ?? true,
    outOfStock: settings.notifications?.outOfStock ?? true,
    overstock: settings.notifications?.overstock ?? true,
    expiring: settings.notifications?.expiring ?? true,
    delayedPO: settings.notifications?.delayedPO ?? true,
  });

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Currency symbols map
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    dispatch(updateSettings({
      businessName,
      currency,
      currencySymbol: currencySymbols[currency] || '₹',
      dateFormat,
      lowStockThreshold: Number(lowStockThreshold),
      expiryWarningDays: Number(expiryWarningDays),
      theme,
      notifications,
    }));
    toast.success('System settings updated successfully');
  };

  // Reset Demo Data
  const handleConfirmReset = () => {
    clearState();
    const fresh = generateAllSeedData();

    dispatch(resetProducts());
    dispatch(resetCategories());
    dispatch(resetWarehouses());
    dispatch(resetSuppliers());
    dispatch(setMovements(fresh.movements));
    dispatch(setPurchaseOrders(fresh.purchaseOrders));
    dispatch(setSales(fresh.sales));
    dispatch(clearAlerts());
    dispatch(resetSettings());

    setBusinessName('StockWise Inventory Solutions');
    setCurrency('INR');
    setDateFormat('dd/MM/yyyy');
    setLowStockThreshold(1.0);
    setExpiryWarningDays(30);
    setTheme('light');
    setNotifications({
      lowStock: true,
      outOfStock: true,
      overstock: true,
      expiring: true,
      delayedPO: true,
    });

    toast.success('Application demo data reset to default seed state');
    setIsResetConfirmOpen(false);
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const raw = localStorage.getItem('stockwise_data');
    if (!raw) {
      toast.error('No stored state available to export');
      return;
    }
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockwise_system_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('System backup JSON downloaded');
  };

  // Import JSON backup
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.state) throw new Error('Invalid backup structure');
        localStorage.setItem('stockwise_data', JSON.stringify(json));
        toast.success('State restored from backup. Reloading page...');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        toast.error('Failed to parse backup JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Settings & System Configurations"
        subtitle="Enterprise preferences, currencies, threshold calibrations & database backups"
      />

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Building size={18} className="text-primary" />
            <h3 className="section-title">Company Profile & Branding</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Organization / Legal Entity Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Tax Identifier / GSTIN</label>
              <input
                type="text"
                defaultValue="27AABCU9603R1ZM"
                placeholder="GSTIN / VAT Number"
                className="input-field font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Regional & Monetary */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <DollarSign size={18} className="text-primary" />
            <h3 className="section-title">Currency & Date Localization</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Operating Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="select-field"
              >
                <option value="INR">INR (₹) - Indian Rupee (Default)</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
              </select>
              <span className="text-xs text-text-tertiary mt-1 block">
                Formats all dashboard charts, purchase vouchers and invoices.
              </span>
            </div>

            <div>
              <label className="label-text">Date Display Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="select-field"
              >
                <option value="dd/MM/yyyy">DD/MM/YYYY (e.g. 13/11/2026)</option>
                <option value="MM/dd/yyyy">MM/DD/YYYY (e.g. 11/13/2026)</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Intelligence & Warning Thresholds */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Shield size={18} className="text-primary" />
            <h3 className="section-title">Stock Intelligence Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Low Stock Sensitivity Multiplier</label>
              <select
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="select-field"
              >
                <option value={1.0}>1.0x (Exact Reorder Threshold)</option>
                <option value={1.2}>1.2x (Trigger at 120% of Reorder Point)</option>
                <option value={1.5}>1.5x (Early Buffer Warning)</option>
              </select>
            </div>

            <div>
              <label className="label-text">Batch Expiration Alert Horizon</label>
              <select
                value={expiryWarningDays}
                onChange={(e) => setExpiryWarningDays(Number(e.target.value))}
                className="select-field"
              >
                <option value={15}>15 Days in Advance</option>
                <option value={30}>30 Days in Advance (Standard)</option>
                <option value={60}>60 Days in Advance</option>
                <option value={90}>90 Days in Advance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Notifications Rules */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Bell size={18} className="text-primary" />
            <h3 className="section-title">Notification Subscription Preferences</h3>
          </div>

          <div className="space-y-3 text-sm">
            {[
              { key: 'outOfStock', label: 'Out of Stock Outages', desc: 'Alert immediately when any SKU available balance hits zero' },
              { key: 'lowStock', label: 'Low Stock Reorder Triggers', desc: 'Notify procurement when inventory drops below safety threshold' },
              { key: 'overstock', label: 'Warehouse Overcapacity Warnings', desc: 'Warn when storage exceeds configured maximum safety targets' },
              { key: 'expiring', label: 'Perishable Expiry Notice', desc: 'Flag lots nearing expiration deadlines for FIFO scheduling' },
              { key: 'delayedPO', label: 'Delayed Supplier Deliveries', desc: 'Alert when vendor expected delivery date has passed' },
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3 p-2 rounded-lg hover:bg-background-secondary/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="rounded border-border mt-0.5"
                />
                <div>
                  <span className="font-medium text-text-primary block">{item.label}</span>
                  <span className="text-xs text-text-secondary">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Save Preferences
          </button>
        </div>
      </form>

      {/* Section 5: Data Management & Reset */}
      <div className="card p-6 space-y-4 border-amber-200 bg-amber-50/20">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <RotateCcw size={18} className="text-amber-600" />
          <h3 className="section-title text-amber-900">Data Backup, Restore & Reset</h3>
        </div>

        <p className="text-xs text-text-secondary">
          All changes are persistently cached in your browser's LocalStorage. You can export a snapshot backup,
          restore an existing configuration, or restore the initial enterprise seed data (100+ products, 12 categories, 15 suppliers, 5 warehouses).
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button onClick={handleExportBackup} className="btn-secondary btn-sm flex items-center gap-1.5">
            <Download size={15} />
            <span>Export Backup JSON</span>
          </button>

          <label className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer">
            <Upload size={15} />
            <span>Restore from JSON</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="btn-danger btn-sm flex items-center gap-1.5"
          >
            <RefreshCw size={15} />
            <span>Reset Demo Data to Defaults</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Demo Data"
        message="Are you sure you want to restore the default demo data? This will purge local storage modifications and restore 100+ fresh products, warehouses, suppliers, purchase orders and sales history."
        confirmText="Reset to Initial Data"
        variant="danger"
      />
    </div>
  );
}
