# StockWise • Enterprise Inventory & Stock Intelligence SaaS Platform

[![React](https://img.shields.io/badge/React-19.3.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3.8-646CFF.svg)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.14.0-764ABC.svg)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.3.5-38B2AC.svg)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.10.1-22C55E.svg)](https://recharts.org/)

**StockWise** is an enterprise-grade, client-side SaaS web application designed for retailers, wholesalers, distributors, warehouse operators, and SMBs. It delivers realistic supply chain and inventory control workflows with robust data relationships, live operational analytics, automated auditing, and resilient frontend storage.

---

## 🌟 Key Functional Modules

### 1. Executive Analytics Dashboard
- **6 Dynamic KPI Metric Cards**: Live calculations for Total SKUs, Inventory Capital Valuation, Total Stored Units, Low Stock Warnings, Stockout Outages, and Pending Purchase Orders with month-over-month trend indicators.
- **6 Interactive Recharts Visualizations**:
  - *Inventory Value Over Time* (Multi-horizon 7D / 30D / 90D trend analysis)
  - *Valuation by Merchandise Category* (Donut distribution)
  - *Top Selling Products* (Horizontal velocity comparison)
  - *Stock Flow Analysis* (Inbound shipments vs outbound dispatches)
  - *Warehouse Stock Levels* (Multi-facility volume benchmarking)
  - *Stock Health Ratios* (Healthy vs Low Stock vs Depleted SKUs)
- **Real-Time Operational Widgets**: Live movement ledger stream, instant low-stock procurement quick-actions, and recent purchase orders.

### 2. Product Catalog Management
- **Enterprise Product Data Table**: Search by SKU, title, brand, or barcode; multi-column sorting; paginated records; customizable visible column picker.
- **Advanced Multi-Dimension Filters**: Filter by Merchandise Category, Assigned Facility, Primary Supplier, or Stock Health status.
- **Creation & Modification Modals**: Form validation with duplicate SKU collision prevention, automated profit margin calculation, pricing and safety buffer thresholds.
- **Bulk Operations**: Multi-selection, batch category reassignment, and safe bulk deletions.
- **Data Portability**: Full CSV Export and PapaParse-powered CSV Import with schema validation.

### 3. Category & Taxonomy Control
- Categorization with custom color-coding, active product counting, and segment capital valuation.
- **Referential Integrity Protection**: Strict protection preventing accidental deletion of categories containing active products, with mandatory re-assignment workflows.

### 4. Dedicated Live Inventory Control
- Complete visibility into Physical On-Hand, Reserved Stock, Unreserved Available Stock, and Incoming Purchase Order quantities.
- **Atomic Stock Operations**:
  - **Stock In (+)**: Increments available inventory and writes an auditable receipt entry.
  - **Stock Out (-)**: Dispatches inventory with negative-balance prevention safeguards.
  - **Stock Adjustment**: Records audit count variances.
  - **Inter-Warehouse Transfer**: Atomically shifts stock between source and destination facilities.
  - **Reservation & Release**: Allocates stock to customer holds or sales orders without issuing dispatches.

### 5. Stock Movement Ledger & Audit History
- Detailed ledger recording every transaction: `purchase_received`, `sales_issued`, `stock_adjustment`, `warehouse_transfer`, `stock_return`, `reserved`, and `released`.
- Filterable by transaction type, date horizon (7D / 30D / 90D), warehouse, and SKU.
- Direct **CSV Export** and **Audit-Ready PDF Export** using `jspdf` and `jspdf-autotable`.

### 6. Multi-Warehouse Facilities Management
- Storage distribution hubs across Mumbai, Delhi, Bangalore, Kolkata, and Ahmedabad.
- Real-time **Capacity Utilization Bars** benchmarked against designated storage quotas.
- Stock manifest inspection drawer for facility-level inventory auditing.

### 7. Supplier & Vendor Relationships
- Full vendor profiles with payment terms (Net 7, Net 15, Net 30, Net 60), contact persons, and supplied product catalogs.
- Procurement history and active PO tracking.
- Protection against deleting vendors with open purchase commitments.

### 8. Purchase Order Procurement Workflow
- Full lifecycle: `Draft` ➔ `Sent` ➔ `Partially Received` ➔ `Received` (or `Cancelled`).
- Multi-product dynamic line-item builder with automated subtotals, tax rates, and discounts.
- **Partial & Full Inwarding**: Receiving goods automatically increments physical inventory in the destination warehouse and records stock receipts in the ledger.
- Printable, downloadable formal **PDF Purchase Orders**.

### 9. Sales & Invoicing Module
- Sales order creation with customer details, fulfillment warehouse selection, and line items.
- **Strict Stock Allocation Validation**: Prevents selling more units than physically available.
- Automated stock decrement and movement ledger entries on sale completion.
- **Sales Return Processing**: Seamlessly restores returned inventory back into facility stock.
- Downloadable **Sales Invoices** in PDF format.

### 10. Reports & Financial Intelligence
- 10 Advanced Analytical Reports:
  1. *Inventory Valuation Report* ($\sum \text{Quantity} \times \text{Cost Price}$)
  2. *Stock Movement Flow*
  3. *Low Stock & Reorders*
  4. *Product Performance*
  5. *Category Distribution*
  6. *Supplier Procurement*
  7. *Warehouse Capacity*
  8. *Purchase Order Audit*
  9. *Sales & Revenue*
  10. *Profitability & COGS* ($\text{Gross Profit} = \text{Revenue} - \text{COGS}$)
- Integrated CSV and PDF document generation.

### 11. Smart Inventory Alerts Engine
- Automated rule heuristics flagging Out of Stock emergencies, Low Stock reorder points, Storage Overcapacity, Perishables Expiring within warning thresholds, and Overdue Vendor Deliveries.
- Severity classification (`critical`, `warning`, `info`) with quick-action navigation.

### 12. Settings & System Preferences
- Organization branding and GSTIN profile.
- Multi-currency localization support (INR `₹`, USD `$`, EUR `€`, GBP `£`, AED `د.إ`).
- Configurable warning thresholds and notification subscription toggles.
- **Full JSON Backup & Restore** and **Reset Demo Data** capability.

---

## 🛠️ Technology Stack

| Layer | Library / Tool |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **State Architecture** | [Redux Toolkit](https://redux-toolkit.js.org/) + [React Redux](https://react-redux.js.org/) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Data Visualizations** | [Recharts v3](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com/) |
| **Date Formatting** | [date-fns v4](https://date-fns.org/) |
| **CSV Parser / Generator** | [PapaParse](https://www.papaparse.com/) |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Storage Engine** | Browser LocalStorage with automatic schema serialization |

---

## 📂 Project Structure

```
INVENTORY & STOCK INTELLIGENCE/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ConfirmDialog.jsx     # Reusable confirmation modal
│   │   │   ├── DataTable.jsx         # Sortable, selectable table component
│   │   │   ├── EmptyState.jsx        # Professional zero-state illustration
│   │   │   ├── ExportMenu.jsx        # CSV/PDF export popup
│   │   │   ├── FilterDropdown.jsx    # Custom dropdown filter
│   │   │   ├── LoadingSkeleton.jsx   # Skeleton state placeholder
│   │   │   ├── Modal.jsx             # Accessible modal dialog
│   │   │   ├── PageHeader.jsx        # Standardized page title & actions
│   │   │   ├── Pagination.jsx        # Accessible pagination controls
│   │   │   ├── SearchBar.jsx         # Debounced search input
│   │   │   ├── StatCard.jsx          # KPI analytics card with trend indicators
│   │   │   └── StatusBadge.jsx       # Color-coded enterprise status pill
│   │   └── layout/
│   │       ├── AppLayout.jsx         # Master responsive wrapper
│   │       ├── Sidebar.jsx           # Collapsible 12-item navigation
│   │       └── Topbar.jsx            # Global search, theme & quick actions
│   ├── data/
│   │   └── seedData.js               # 100+ products, 12 categories, 15 suppliers, etc.
│   ├── pages/
│   │   ├── CategoriesPage.jsx        # Category taxonomy & re-assignment
│   │   ├── DashboardPage.jsx         # Executive overview & 6 charts
│   │   ├── InventoryPage.jsx         # Atomic stock operations (In, Out, Transfer, Reserve)
│   │   ├── MovementsPage.jsx         # Auditable transaction ledger
│   │   ├── NotificationsPage.jsx     # Smart heuristic alerts engine
│   │   ├── ProductsPage.jsx          # Complete product catalog & CSV import/export
│   │   ├── PurchaseOrdersPage.jsx    # PO lifecycle & stock inwarding
│   │   ├── ReportsPage.jsx           # 10 financial & operational reports
│   │   ├── SalesPage.jsx             # Invoicing, dispatches & sales returns
│   │   ├── SettingsPage.jsx          # LocalStorage persistence & backup
│   │   ├── SuppliersPage.jsx         # Vendor management & profiles
│   │   └── WarehousesPage.jsx        # Storage facility capacity analytics
│   ├── store/
│   │   ├── slices/
│   │   │   ├── alertsSlice.js
│   │   │   ├── categoriesSlice.js
│   │   │   ├── inventorySlice.js
│   │   │   ├── movementsSlice.js
│   │   │   ├── productsSlice.js
│   │   │   ├── purchaseOrdersSlice.js
│   │   │   ├── salesSlice.js
│   │   │   ├── settingsSlice.js
│   │   │   ├── suppliersSlice.js
│   │   │   └── warehousesSlice.js
│   │   ├── index.js                  # Redux configureStore
│   │   └── persistence.js            # Safe debounced LocalStorage engine
│   ├── utils/
│   │   ├── helpers.js                # Currency, date, formatting & calculations
│   │   └── pdfGenerator.js           # jsPDF reports & invoice templates
│   ├── App.jsx                       # Router provider & data initializers
│   ├── index.css                     # Design tokens & Tailwind theme
│   └── main.jsx                      # App root mount
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` to interact with the application.

### 3. Production Build
Verify the production build:
```bash
npm run build
```

---

## 🔒 Data Integrity & Storage Rules

1. **Zero External Backend Dependencies**: The application runs entirely within modern web browsers with zero Express, MongoDB, or Firebase requirements.
2. **Deterministic Seed State**: 100+ SKUs across 12 product categories, 15 vetted suppliers, 5 distribution warehouses, 100+ historical stock movements, 50 purchase orders, and 100 sales invoices are initialized on first boot.
3. **Atomic Stock Movements**: Stock transfers between facilities atomically deduct from source and credit to destination within a single action. Stock intake from purchase orders prevents receiving more than the outstanding quantity. Sales dispatches strictly reject transactions when requested units exceed physical on-hand stock.
4. **Resilient Persistence**: State updates are debounced and synchronized with `localStorage`. In case of corrupted storage, safe fallback hydration is automatically triggered without crashing the application.
