import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Boxes, ArrowLeftRight,
  Warehouse, Truck, ShoppingCart, BarChart3, Bell, Settings,
  ChevronLeft, ClipboardList, Menu,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/inventory', label: 'Inventory', icon: Boxes },
  { path: '/movements', label: 'Stock Movements', icon: ArrowLeftRight },
  { path: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { path: '/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/purchases', label: 'Purchase Orders', icon: ClipboardList },
  { path: '/sales', label: 'Sales', icon: ShoppingCart },
  { path: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onToggle, isMobile }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-border z-50
        transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'w-64' : 'w-[70px]'}
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Boxes size={18} className="text-white" />
            </div>
            {isOpen && (
              <span className="font-bold text-text-primary text-sm whitespace-nowrap">StockWise</span>
            )}
          </div>
          {!isMobile && (
            <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-background-secondary text-text-secondary">
              <ChevronLeft size={18} className={`transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => isMobile && onToggle()}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary-50 text-primary'
                      : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                    }
                  `}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {isOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="text-xs text-text-tertiary">StockWise v1.0</div>
            <div className="text-xs text-text-tertiary">Inventory Intelligence</div>
          </div>
        )}
      </aside>
    </>
  );
}
