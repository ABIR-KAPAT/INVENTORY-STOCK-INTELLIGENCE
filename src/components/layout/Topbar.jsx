import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, User, ChevronRight, Sun, Moon, Plus, X } from 'lucide-react';
import { selectUnreadAlerts } from '../../store/slices/alertsSlice';
import { selectSettings, updateSettings } from '../../store/slices/settingsSlice';
import { selectAllProducts } from '../../store/slices/productsSlice';
import { selectAllSuppliers } from '../../store/slices/suppliersSlice';
import { selectAllWarehouses } from '../../store/slices/warehousesSlice';

const breadcrumbMap = {
  '/': 'Overview',
  '/products': 'Products',
  '/categories': 'Categories',
  '/inventory': 'Inventory',
  '/movements': 'Stock Movements',
  '/warehouses': 'Warehouses',
  '/suppliers': 'Suppliers',
  '/purchases': 'Purchase Orders',
  '/sales': 'Sales',
  '/reports': 'Reports & Analytics',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export default function Topbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const unreadAlerts = useSelector(selectUnreadAlerts);
  const settings = useSelector(selectSettings);
  const products = useSelector(selectAllProducts);
  const suppliers = useSelector(selectAllSuppliers);
  const warehouses = useSelector(selectAllWarehouses);

  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  useEffect(() => {
    if (!searchTerm.trim()) { setSearchResults([]); return; }
    const term = searchTerm.toLowerCase();
    const results = [];

    products.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term))
      .slice(0, 5).forEach(p => results.push({ type: 'Product', name: p.name, sub: p.sku, path: `/products` }));

    suppliers.filter(s => s.name.toLowerCase().includes(term) || s.company.toLowerCase().includes(term))
      .slice(0, 3).forEach(s => results.push({ type: 'Supplier', name: s.name, sub: s.company, path: `/suppliers` }));

    warehouses.filter(w => w.name.toLowerCase().includes(term) || w.city.toLowerCase().includes(term))
      .slice(0, 3).forEach(w => results.push({ type: 'Warehouse', name: w.name, sub: w.city, path: `/warehouses` }));

    setSearchResults(results);
  }, [searchTerm, products, suppliers, warehouses]);

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPage = breadcrumbMap[location.pathname] || pathParts[pathParts.length - 1] || 'Overview';

  const toggleTheme = () => {
    dispatch(updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' }));
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary lg:hidden">
          <Menu size={20} />
        </button>
        <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary hidden lg:block">
          <Menu size={20} />
        </button>
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <button onClick={() => navigate('/')} className="text-text-secondary hover:text-text-primary">Home</button>
          <ChevronRight size={14} className="text-text-tertiary" />
          <span className="font-medium text-text-primary">{currentPage}</span>
        </nav>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          {showSearch ? (
            <div className="flex items-center">
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, suppliers..."
                className="input-field w-48 md:w-72 text-sm"
                onKeyDown={(e) => e.key === 'Escape' && setShowSearch(false)}
              />
              <button onClick={() => { setShowSearch(false); setSearchTerm(''); setSearchResults([]); }} className="p-2 text-text-secondary">
                <X size={16} />
              </button>
              {searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-1 w-full bg-white border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { navigate(r.path); setShowSearch(false); setSearchTerm(''); setSearchResults([]); }}
                      className="w-full text-left px-4 py-3 hover:bg-background-secondary border-b border-border last:border-0"
                    >
                      <span className="text-xs font-medium text-primary uppercase">{r.type}</span>
                      <p className="text-sm font-medium text-text-primary">{r.name}</p>
                      <p className="text-xs text-text-secondary">{r.sub}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)} className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary" title="Search (Ctrl+K)">
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Quick Action */}
        <div className="relative">
          <button onClick={() => setShowQuickActions(!showQuickActions)} className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary" title="Quick Actions">
            <Plus size={20} />
          </button>
          {showQuickActions && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowQuickActions(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-border rounded-lg shadow-lg z-40 py-1">
                {[
                  { label: 'Add Product', path: '/products?action=add' },
                  { label: 'New Purchase Order', path: '/purchases?action=add' },
                  { label: 'New Sale', path: '/sales?action=add' },
                  { label: 'Stock Adjustment', path: '/inventory?action=adjust' },
                ].map(item => (
                  <button key={item.path} onClick={() => { navigate(item.path); setShowQuickActions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary" title="Toggle Theme">
          {settings.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-lg hover:bg-background-secondary text-text-secondary" title="Notifications">
          <Bell size={20} />
          {unreadAlerts.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <span className="hidden md:block text-sm font-medium text-text-primary">Admin</span>
        </div>
      </div>
    </header>
  );
}
