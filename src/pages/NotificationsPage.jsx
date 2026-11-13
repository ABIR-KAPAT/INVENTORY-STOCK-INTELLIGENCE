import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Bell, AlertTriangle, AlertCircle, Info, Clock,
  CheckCircle2, Trash2, Check, ArrowRight, RefreshCw,
  Filter, Package, ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import {
  selectAllAlerts, markAlertRead, markAllRead,
  dismissAlert, clearAlerts, setAlerts
} from '../store/slices/alertsSlice';
import { selectAllProducts } from '../store/slices/productsSlice';
import { selectAllPurchaseOrders } from '../store/slices/purchaseOrdersSlice';
import { formatDate } from '../utils/helpers';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const alerts = useSelector(selectAllAlerts);
  const products = useSelector(selectAllProducts);
  const purchaseOrders = useSelector(selectAllPurchaseOrders);

  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSev = selectedSeverity === 'all' || a.severity === selectedSeverity;
      const matchType = selectedType === 'all' || a.type === selectedType;
      return matchSev && matchType;
    });
  }, [alerts, selectedSeverity, selectedType]);

  // Recalculate Alerts Engine
  const handleRegenerateAlerts = () => {
    const generated = [];
    const now = new Date();

    products.forEach(p => {
      if (p.stock === 0) {
        generated.push({
          type: 'out_of_stock',
          severity: 'critical',
          title: 'Stock Outage Alert',
          productId: p.id,
          description: `${p.name} (${p.sku}) is currently completely depleted (0 ${p.unit}).`,
          suggestedAction: 'Create immediate emergency procurement purchase order.',
          createdAt: now.toISOString(),
          read: false,
        });
      } else if (p.stock <= p.reorderPoint) {
        generated.push({
          type: 'low_stock',
          severity: 'warning',
          title: 'Low Stock Level Reached',
          productId: p.id,
          description: `${p.name} (${p.sku}) has reached reorder threshold (${p.stock}/${p.reorderPoint} ${p.unit}).`,
          suggestedAction: 'Place purchase order with primary supplier.',
          createdAt: now.toISOString(),
          read: false,
        });
      }

      if (p.maxStock && p.stock > p.maxStock) {
        generated.push({
          type: 'overstock',
          severity: 'info',
          title: 'Excess Inventory Warning',
          productId: p.id,
          description: `${p.name} on-hand count (${p.stock}) exceeds facility max target of ${p.maxStock} ${p.unit}.`,
          suggestedAction: 'Hold future purchase orders or transfer to alternate hub.',
          createdAt: now.toISOString(),
          read: false,
        });
      }

      if (p.expiryDate) {
        const exp = new Date(p.expiryDate);
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 45 && diffDays > 0) {
          generated.push({
            type: 'expiring',
            severity: 'warning',
            title: 'Inventory Expiration Warning',
            productId: p.id,
            description: `${p.name} batch expires in ${diffDays} days (${p.expiryDate}).`,
            suggestedAction: 'Run promotional discount or prioritize first-in-first-out dispatch.',
            createdAt: now.toISOString(),
            read: false,
          });
        }
      }
    });

    purchaseOrders.filter(po => ['sent', 'partially_received'].includes(po.status)).forEach(po => {
      const expDate = new Date(po.expectedDate);
      if (expDate < now) {
        generated.push({
          type: 'delayed_po',
          severity: 'warning',
          title: 'Overdue Vendor Shipment',
          poId: po.id,
          description: `Purchase order ${po.poNumber} from ${po.supplierName} missed delivery date (${po.expectedDate.split('T')[0]}).`,
          suggestedAction: 'Contact supplier procurement representative.',
          createdAt: now.toISOString(),
          read: false,
        });
      }
    });

    dispatch(setAlerts(generated));
    toast.success(`Inventory Intelligence evaluated: ${generated.length} active alerts`);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
    toast.success('All alerts marked as read');
  };

  const handleClearAll = () => {
    dispatch(clearAlerts());
    toast.success('Cleared all alerts');
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-800',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800',
          icon: Info,
        };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Inventory Intelligence & Alerts"
        subtitle="Automated warning heuristics, stockout hazards, delayed shipments & expiration deadlines"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerateAlerts}
            className="btn-secondary btn-sm flex items-center gap-1.5"
            title="Scan & Recalculate"
          >
            <RefreshCw size={15} />
            <span>Re-evaluate Alerts</span>
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={alerts.length === 0}
            className="btn-secondary btn-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check size={15} />
            <span className="hidden sm:inline">Mark All Read</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={alerts.length === 0}
            className="btn-danger btn-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </PageHeader>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="select-field text-xs py-1.5 w-36"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (Out of Stock)</option>
            <option value="warning">Warning (Low Stock / Expiring)</option>
            <option value="info">Info (Overstock)</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="select-field text-xs py-1.5 w-44"
          >
            <option value="all">All Alert Types</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock Threshold</option>
            <option value="overstock">Overstock Capacity</option>
            <option value="expiring">Expiring Product</option>
            <option value="delayed_po">Delayed Purchase Order</option>
          </select>
        </div>

        <div className="text-xs text-text-secondary">
          Active Alerts: <strong>{filteredAlerts.length}</strong> (Unread:{' '}
          <strong className="text-primary">{alerts.filter(a => !a.read).length}</strong>)
        </div>
      </div>

      {/* Alert Feed */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          title="No alerts found"
          description="Your inventory health is in optimal condition. Click 'Re-evaluate Alerts' to run live rule checks."
          action={handleRegenerateAlerts}
          actionLabel="Run Health Check"
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => {
            const style = getSeverityStyle(alert.severity);
            const Icon = style.icon;

            return (
              <div
                key={alert.id}
                className={`card p-4 border transition-all ${style.bg} ${style.border} ${
                  alert.read ? 'opacity-70 bg-white/70' : 'shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl bg-white shadow-xs ${style.text} flex-shrink-0 mt-0.5`}>
                      <Icon size={20} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                          {alert.severity}
                        </span>
                        <h4 className="font-semibold text-text-primary text-sm">{alert.title}</h4>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-primary" title="Unread" />
                        )}
                      </div>

                      <p className="text-xs text-text-primary font-medium">{alert.description}</p>

                      {alert.suggestedAction && (
                        <p className="text-xs text-text-secondary">
                          <strong>Recommended action:</strong> {alert.suggestedAction}
                        </p>
                      )}

                      <span className="text-[11px] text-text-tertiary block pt-1">
                        Reported {formatDate(alert.createdAt, 'dd MMM yyyy, HH:mm')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {alert.productId && (
                      <button
                        onClick={() => navigate(`/inventory?search=${alert.productId}`)}
                        className="btn-secondary btn-sm text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        <span>Inventory</span>
                        <ArrowRight size={12} />
                      </button>
                    )}

                    {alert.poId && (
                      <button
                        onClick={() => navigate('/purchases')}
                        className="btn-secondary btn-sm text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        <span>View PO</span>
                        <ArrowRight size={12} />
                      </button>
                    )}

                    {!alert.read && (
                      <button
                        onClick={() => dispatch(markAlertRead(alert.id))}
                        className="p-1 rounded hover:bg-white text-text-secondary hover:text-primary transition-colors"
                        title="Mark as Read"
                      >
                        <Check size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => dispatch(dismissAlert(alert.id))}
                      className="p-1 rounded hover:bg-white text-text-secondary hover:text-danger transition-colors"
                      title="Dismiss Alert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
