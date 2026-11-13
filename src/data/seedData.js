import { v4 } from './utils/helpers';

// ============ CATEGORIES ============
export const seedCategories = [
  { id: 'cat-001', name: 'Electronics', description: 'Electronic devices and components', color: '#2563EB', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-002', name: 'Clothing & Apparel', description: 'Fashion items and accessories', color: '#7C3AED', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-003', name: 'Food & Beverages', description: 'Consumable food products and drinks', color: '#16A34A', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-004', name: 'Home & Kitchen', description: 'Household items and kitchen essentials', color: '#F59E0B', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-005', name: 'Office Supplies', description: 'Stationery and office equipment', color: '#64748B', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-006', name: 'Health & Personal Care', description: 'Healthcare and personal hygiene products', color: '#EC4899', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-007', name: 'Sports & Outdoors', description: 'Sporting goods and outdoor equipment', color: '#14B8A6', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-008', name: 'Automotive', description: 'Vehicle parts and accessories', color: '#EF4444', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-009', name: 'Books & Media', description: 'Books, magazines, and digital media', color: '#8B5CF6', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-010', name: 'Tools & Hardware', description: 'Industrial tools and hardware supplies', color: '#78716C', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-011', name: 'Toys & Games', description: 'Toys, games, and recreational items', color: '#F97316', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'cat-012', name: 'Furniture', description: 'Home and office furniture', color: '#A16207', productCount: 0, createdAt: '2026-01-15T10:00:00Z' },
];

// ============ WAREHOUSES ============
export const seedWarehouses = [
  { id: 'wh-001', name: 'Main Warehouse', code: 'MW-01', address: '42 Industrial Area, Phase II', city: 'Mumbai', manager: 'Rajesh Kumar', contact: '+91 98765 43210', status: 'active', capacity: 50000, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'wh-002', name: 'North Distribution Center', code: 'NDC-01', address: '15 Logistics Park, Sector 62', city: 'Delhi', manager: 'Priya Sharma', contact: '+91 98765 43211', status: 'active', capacity: 35000, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'wh-003', name: 'South Regional Hub', code: 'SRH-01', address: '88 Electronic City, Phase I', city: 'Bangalore', manager: 'Arun Nair', contact: '+91 98765 43212', status: 'active', capacity: 30000, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'wh-004', name: 'East Fulfillment Center', code: 'EFC-01', address: '23 Salt Lake, Sector V', city: 'Kolkata', manager: 'Amit Das', contact: '+91 98765 43213', status: 'active', capacity: 25000, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'wh-005', name: 'West Coast Storage', code: 'WCS-01', address: '56 GIDC Industrial Estate', city: 'Ahmedabad', manager: 'Neha Patel', contact: '+91 98765 43214', status: 'active', capacity: 20000, createdAt: '2026-01-10T10:00:00Z' },
];

// ============ SUPPLIERS ============
export const seedSuppliers = [
  { id: 'sup-001', name: 'TechVision Electronics', company: 'TechVision Pvt. Ltd.', email: 'orders@techvision.in', phone: '+91 22 4567 8901', address: '101 Tech Park, Andheri East', city: 'Mumbai', contactPerson: 'Vikram Mehta', paymentTerms: 'Net 30', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-002', name: 'Global Fashion Hub', company: 'GFH Industries', email: 'supply@gfhub.com', phone: '+91 11 2345 6789', address: '45 Karol Bagh', city: 'Delhi', contactPerson: 'Sonia Kapoor', paymentTerms: 'Net 15', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-003', name: 'Fresh Foods International', company: 'FFI Corp.', email: 'procurement@ffi.co.in', phone: '+91 80 9876 5432', address: '67 Food Processing Zone', city: 'Bangalore', contactPerson: 'Mohammed Ali', paymentTerms: 'Net 7', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-004', name: 'HomeStyle Essentials', company: 'HomeStyle Ltd.', email: 'orders@homestyle.in', phone: '+91 33 5678 1234', address: '12 Howrah Industrial Park', city: 'Kolkata', contactPerson: 'Deepa Roy', paymentTerms: 'Net 30', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-005', name: 'OfficePro Solutions', company: 'OfficePro Pvt. Ltd.', email: 'sales@officepro.com', phone: '+91 79 3456 7890', address: '34 CG Road, Navrangpura', city: 'Ahmedabad', contactPerson: 'Kiran Shah', paymentTerms: 'Net 45', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-006', name: 'WellCare Distributors', company: 'WellCare Group', email: 'orders@wellcare.in', phone: '+91 44 2233 4455', address: '78 Anna Nagar', city: 'Chennai', contactPerson: 'Dr. Lakshmi Subramanian', paymentTerms: 'Net 30', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-007', name: 'SportZone India', company: 'SportZone Pvt. Ltd.', email: 'supply@sportzone.in', phone: '+91 20 6677 8899', address: '23 Hinjewadi IT Park', city: 'Pune', contactPerson: 'Rahul Deshmukh', paymentTerms: 'Net 30', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-008', name: 'AutoParts Express', company: 'APE Industries', email: 'orders@autoparts.com', phone: '+91 141 234 5678', address: '45 Sitapura Industrial Area', city: 'Jaipur', contactPerson: 'Suresh Agarwal', paymentTerms: 'Net 60', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-009', name: 'BookWorld Publishers', company: 'BookWorld Media', email: 'wholesale@bookworld.in', phone: '+91 522 334 5566', address: '12 Hazratganj', city: 'Lucknow', contactPerson: 'Ananya Singh', paymentTerms: 'Net 30', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-010', name: 'BuildRight Tools', company: 'BuildRight Manufacturing', email: 'sales@buildright.com', phone: '+91 265 223 4455', address: '56 GIDC Makarpura', city: 'Vadodara', contactPerson: 'Manoj Patel', paymentTerms: 'Net 45', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-011', name: 'ToyLand Creations', company: 'ToyLand Industries', email: 'orders@toyland.in', phone: '+91 161 556 7788', address: '89 Industrial Area B', city: 'Ludhiana', contactPerson: 'Gurpreet Kaur', paymentTerms: 'Net 30', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-012', name: 'FurniCraft India', company: 'FurniCraft Pvt. Ltd.', email: 'bulk@furnicraft.in', phone: '+91 821 445 6677', address: '34 Hebbal Industrial Estate', city: 'Mysore', contactPerson: 'Venkatesh Gowda', paymentTerms: 'Net 60', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-013', name: 'DigiCore Components', company: 'DigiCore Tech', email: 'parts@digicore.in', phone: '+91 40 7788 9900', address: '67 HITEC City', city: 'Hyderabad', contactPerson: 'Srinivas Reddy', paymentTerms: 'Net 30', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-014', name: 'NatureFresh Organics', company: 'NatureFresh Foods', email: 'supply@naturefresh.org', phone: '+91 484 223 3344', address: '12 Infopark Road', city: 'Kochi', contactPerson: 'Thomas Mathew', paymentTerms: 'Net 15', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
  { id: 'sup-015', name: 'SafeGuard Security', company: 'SafeGuard Solutions', email: 'sales@safeguard.in', phone: '+91 172 445 5566', address: '78 IT Park, Phase I', city: 'Chandigarh', contactPerson: 'Harinder Singh', paymentTerms: 'Net 30', status: 'active', createdAt: '2026-01-12T10:00:00Z' },
];

// ============ PRODUCTS ============
const productData = [
  // Electronics (cat-001)
  { name: 'Wireless Bluetooth Headphones', sku: 'ELEC-001', category: 'cat-001', brand: 'SoundMax', costPrice: 1200, sellingPrice: 2499, supplier: 'sup-001', warehouse: 'wh-001', stock: 150, minStock: 20, maxStock: 300, reorderPoint: 40, unit: 'pcs', barcode: '8901234567001', image: 'https://dummyjson.com/image/150' },
  { name: 'USB-C Fast Charger 65W', sku: 'ELEC-002', category: 'cat-001', brand: 'PowerPlus', costPrice: 450, sellingPrice: 999, supplier: 'sup-001', warehouse: 'wh-001', stock: 300, minStock: 50, maxStock: 500, reorderPoint: 80, unit: 'pcs', barcode: '8901234567002' },
  { name: 'Mechanical Keyboard RGB', sku: 'ELEC-003', category: 'cat-001', brand: 'KeyTech', costPrice: 2500, sellingPrice: 4999, supplier: 'sup-013', warehouse: 'wh-001', stock: 85, minStock: 15, maxStock: 200, reorderPoint: 30, unit: 'pcs', barcode: '8901234567003' },
  { name: 'Wireless Mouse Ergonomic', sku: 'ELEC-004', category: 'cat-001', brand: 'ClickPro', costPrice: 600, sellingPrice: 1299, supplier: 'sup-013', warehouse: 'wh-002', stock: 200, minStock: 30, maxStock: 400, reorderPoint: 50, unit: 'pcs', barcode: '8901234567004' },
  { name: '27" 4K Monitor', sku: 'ELEC-005', category: 'cat-001', brand: 'VisionX', costPrice: 18000, sellingPrice: 29999, supplier: 'sup-001', warehouse: 'wh-001', stock: 25, minStock: 5, maxStock: 50, reorderPoint: 10, unit: 'pcs', barcode: '8901234567005' },
  { name: 'Portable SSD 1TB', sku: 'ELEC-006', category: 'cat-001', brand: 'DataFast', costPrice: 4500, sellingPrice: 7999, supplier: 'sup-013', warehouse: 'wh-003', stock: 60, minStock: 10, maxStock: 120, reorderPoint: 20, unit: 'pcs', barcode: '8901234567006' },
  { name: 'Smart Power Strip', sku: 'ELEC-007', category: 'cat-001', brand: 'PowerPlus', costPrice: 800, sellingPrice: 1799, supplier: 'sup-001', warehouse: 'wh-002', stock: 120, minStock: 20, maxStock: 250, reorderPoint: 40, unit: 'pcs', barcode: '8901234567007' },
  { name: 'Webcam 1080p HD', sku: 'ELEC-008', category: 'cat-001', brand: 'VisionX', costPrice: 1500, sellingPrice: 2999, supplier: 'sup-001', warehouse: 'wh-001', stock: 45, minStock: 10, maxStock: 100, reorderPoint: 15, unit: 'pcs', barcode: '8901234567008' },
  { name: 'Laptop Stand Aluminum', sku: 'ELEC-009', category: 'cat-001', brand: 'DeskPro', costPrice: 900, sellingPrice: 1999, supplier: 'sup-013', warehouse: 'wh-003', stock: 75, minStock: 10, maxStock: 150, reorderPoint: 20, unit: 'pcs', barcode: '8901234567009' },
  { name: 'Noise Cancelling Earbuds', sku: 'ELEC-010', category: 'cat-001', brand: 'SoundMax', costPrice: 3000, sellingPrice: 5999, supplier: 'sup-001', warehouse: 'wh-001', stock: 0, minStock: 15, maxStock: 200, reorderPoint: 25, unit: 'pcs', barcode: '8901234567010' },
  // Clothing (cat-002)
  { name: 'Men\'s Cotton T-Shirt', sku: 'CLTH-001', category: 'cat-002', brand: 'UrbanWear', costPrice: 250, sellingPrice: 599, supplier: 'sup-002', warehouse: 'wh-002', stock: 500, minStock: 100, maxStock: 1000, reorderPoint: 150, unit: 'pcs', barcode: '8901234567011' },
  { name: 'Women\'s Kurti Set', sku: 'CLTH-002', category: 'cat-002', brand: 'EthnicStyle', costPrice: 600, sellingPrice: 1499, supplier: 'sup-002', warehouse: 'wh-002', stock: 250, minStock: 50, maxStock: 500, reorderPoint: 80, unit: 'pcs', barcode: '8901234567012' },
  { name: 'Denim Jeans Slim Fit', sku: 'CLTH-003', category: 'cat-002', brand: 'UrbanWear', costPrice: 800, sellingPrice: 1999, supplier: 'sup-002', warehouse: 'wh-001', stock: 180, minStock: 30, maxStock: 400, reorderPoint: 60, unit: 'pcs', barcode: '8901234567013' },
  { name: 'Formal Shirt Cotton', sku: 'CLTH-004', category: 'cat-002', brand: 'ClassicFit', costPrice: 500, sellingPrice: 1299, supplier: 'sup-002', warehouse: 'wh-002', stock: 320, minStock: 50, maxStock: 600, reorderPoint: 80, unit: 'pcs', barcode: '8901234567014' },
  { name: 'Leather Belt Premium', sku: 'CLTH-005', category: 'cat-002', brand: 'ClassicFit', costPrice: 350, sellingPrice: 899, supplier: 'sup-002', warehouse: 'wh-004', stock: 150, minStock: 25, maxStock: 300, reorderPoint: 40, unit: 'pcs', barcode: '8901234567015' },
  { name: 'Sports Tracksuit', sku: 'CLTH-006', category: 'cat-002', brand: 'UrbanWear', costPrice: 700, sellingPrice: 1699, supplier: 'sup-002', warehouse: 'wh-003', stock: 100, minStock: 20, maxStock: 200, reorderPoint: 35, unit: 'pcs', barcode: '8901234567016' },
  { name: 'Winter Jacket Quilted', sku: 'CLTH-007', category: 'cat-002', brand: 'NorthStar', costPrice: 1500, sellingPrice: 3499, supplier: 'sup-002', warehouse: 'wh-002', stock: 15, minStock: 20, maxStock: 100, reorderPoint: 25, unit: 'pcs', barcode: '8901234567017' },
  { name: 'Cotton Socks Pack of 5', sku: 'CLTH-008', category: 'cat-002', brand: 'ComfortFit', costPrice: 150, sellingPrice: 399, supplier: 'sup-002', warehouse: 'wh-001', stock: 800, minStock: 100, maxStock: 2000, reorderPoint: 200, unit: 'packs', barcode: '8901234567018' },
  // Food & Beverages (cat-003)
  { name: 'Basmati Rice Premium 5kg', sku: 'FOOD-001', category: 'cat-003', brand: 'GoldenGrain', costPrice: 350, sellingPrice: 599, supplier: 'sup-003', warehouse: 'wh-001', stock: 400, minStock: 80, maxStock: 800, reorderPoint: 120, unit: 'bags', barcode: '8901234567019', expiryDate: '2027-06-15' },
  { name: 'Organic Green Tea 100 bags', sku: 'FOOD-002', category: 'cat-003', brand: 'TeaVerde', costPrice: 180, sellingPrice: 399, supplier: 'sup-014', warehouse: 'wh-003', stock: 200, minStock: 40, maxStock: 500, reorderPoint: 60, unit: 'boxes', barcode: '8901234567020', expiryDate: '2027-03-20' },
  { name: 'Mixed Nuts Trail Mix 500g', sku: 'FOOD-003', category: 'cat-003', brand: 'NutriCrunch', costPrice: 280, sellingPrice: 549, supplier: 'sup-003', warehouse: 'wh-001', stock: 150, minStock: 30, maxStock: 300, reorderPoint: 50, unit: 'packs', barcode: '8901234567021', expiryDate: '2027-01-10' },
  { name: 'Cold Pressed Coconut Oil 1L', sku: 'FOOD-004', category: 'cat-003', brand: 'PurePress', costPrice: 200, sellingPrice: 450, supplier: 'sup-014', warehouse: 'wh-003', stock: 300, minStock: 50, maxStock: 600, reorderPoint: 80, unit: 'bottles', barcode: '8901234567022', expiryDate: '2027-09-01' },
  { name: 'Instant Coffee 200g Jar', sku: 'FOOD-005', category: 'cat-003', brand: 'BrewMaster', costPrice: 250, sellingPrice: 499, supplier: 'sup-003', warehouse: 'wh-002', stock: 180, minStock: 40, maxStock: 400, reorderPoint: 60, unit: 'jars', barcode: '8901234567023', expiryDate: '2027-12-31' },
  { name: 'Dark Chocolate Bar 100g', sku: 'FOOD-006', category: 'cat-003', brand: 'CocoBliss', costPrice: 80, sellingPrice: 199, supplier: 'sup-003', warehouse: 'wh-004', stock: 600, minStock: 100, maxStock: 1200, reorderPoint: 150, unit: 'bars', barcode: '8901234567024', expiryDate: '2027-04-15' },
  { name: 'Protein Energy Bar Pack', sku: 'FOOD-007', category: 'cat-003', brand: 'FitFuel', costPrice: 120, sellingPrice: 299, supplier: 'sup-003', warehouse: 'wh-001', stock: 350, minStock: 60, maxStock: 700, reorderPoint: 100, unit: 'packs', barcode: '8901234567025', expiryDate: '2026-12-01' },
  { name: 'Honey Raw Organic 500g', sku: 'FOOD-008', category: 'cat-003', brand: 'BeeNatural', costPrice: 320, sellingPrice: 649, supplier: 'sup-014', warehouse: 'wh-005', stock: 100, minStock: 20, maxStock: 200, reorderPoint: 35, unit: 'jars', barcode: '8901234567026', expiryDate: '2028-01-01' },
  // Home & Kitchen (cat-004)
  { name: 'Stainless Steel Cookware Set', sku: 'HOME-001', category: 'cat-004', brand: 'KitchenPro', costPrice: 2500, sellingPrice: 4999, supplier: 'sup-004', warehouse: 'wh-004', stock: 40, minStock: 10, maxStock: 80, reorderPoint: 15, unit: 'sets', barcode: '8901234567027' },
  { name: 'Non-Stick Frying Pan 28cm', sku: 'HOME-002', category: 'cat-004', brand: 'KitchenPro', costPrice: 600, sellingPrice: 1299, supplier: 'sup-004', warehouse: 'wh-001', stock: 90, minStock: 15, maxStock: 200, reorderPoint: 25, unit: 'pcs', barcode: '8901234567028' },
  { name: 'Glass Water Bottle 1L', sku: 'HOME-003', category: 'cat-004', brand: 'PureLife', costPrice: 200, sellingPrice: 499, supplier: 'sup-004', warehouse: 'wh-002', stock: 250, minStock: 40, maxStock: 500, reorderPoint: 60, unit: 'pcs', barcode: '8901234567029' },
  { name: 'Cotton Bed Sheet King Size', sku: 'HOME-004', category: 'cat-004', brand: 'DreamWeave', costPrice: 800, sellingPrice: 1899, supplier: 'sup-004', warehouse: 'wh-001', stock: 120, minStock: 20, maxStock: 250, reorderPoint: 35, unit: 'sets', barcode: '8901234567030' },
  { name: 'LED Table Lamp Adjustable', sku: 'HOME-005', category: 'cat-004', brand: 'BrightHome', costPrice: 700, sellingPrice: 1499, supplier: 'sup-004', warehouse: 'wh-003', stock: 65, minStock: 10, maxStock: 130, reorderPoint: 20, unit: 'pcs', barcode: '8901234567031' },
  { name: 'Vacuum Flask 750ml', sku: 'HOME-006', category: 'cat-004', brand: 'ThermoKeep', costPrice: 450, sellingPrice: 999, supplier: 'sup-004', warehouse: 'wh-005', stock: 180, minStock: 30, maxStock: 350, reorderPoint: 50, unit: 'pcs', barcode: '8901234567032' },
  { name: 'Microfiber Bath Towel Set', sku: 'HOME-007', category: 'cat-004', brand: 'SoftTouch', costPrice: 400, sellingPrice: 899, supplier: 'sup-004', warehouse: 'wh-002', stock: 200, minStock: 30, maxStock: 400, reorderPoint: 50, unit: 'sets', barcode: '8901234567033' },
  { name: 'Kitchen Knife Set 6pc', sku: 'HOME-008', category: 'cat-004', brand: 'SharpEdge', costPrice: 1200, sellingPrice: 2499, supplier: 'sup-004', warehouse: 'wh-001', stock: 55, minStock: 10, maxStock: 100, reorderPoint: 18, unit: 'sets', barcode: '8901234567034' },
  { name: 'Pressure Cooker 5L', sku: 'HOME-009', category: 'cat-004', brand: 'KitchenPro', costPrice: 1500, sellingPrice: 2999, supplier: 'sup-004', warehouse: 'wh-004', stock: 70, minStock: 10, maxStock: 150, reorderPoint: 20, unit: 'pcs', barcode: '8901234567035' },
  // Office Supplies (cat-005)
  { name: 'A4 Copier Paper 500 Sheets', sku: 'OFFC-001', category: 'cat-005', brand: 'PaperWhite', costPrice: 180, sellingPrice: 350, supplier: 'sup-005', warehouse: 'wh-001', stock: 1000, minStock: 200, maxStock: 2000, reorderPoint: 300, unit: 'reams', barcode: '8901234567036' },
  { name: 'Gel Pen Set 10 Colors', sku: 'OFFC-002', category: 'cat-005', brand: 'WriteSmooth', costPrice: 120, sellingPrice: 249, supplier: 'sup-005', warehouse: 'wh-002', stock: 400, minStock: 80, maxStock: 800, reorderPoint: 120, unit: 'sets', barcode: '8901234567037' },
  { name: 'Desktop Organizer Mesh', sku: 'OFFC-003', category: 'cat-005', brand: 'DeskPro', costPrice: 350, sellingPrice: 699, supplier: 'sup-005', warehouse: 'wh-005', stock: 90, minStock: 15, maxStock: 180, reorderPoint: 25, unit: 'pcs', barcode: '8901234567038' },
  { name: 'Whiteboard Marker Set', sku: 'OFFC-004', category: 'cat-005', brand: 'WriteSmooth', costPrice: 80, sellingPrice: 199, supplier: 'sup-005', warehouse: 'wh-001', stock: 300, minStock: 50, maxStock: 600, reorderPoint: 80, unit: 'sets', barcode: '8901234567039' },
  { name: 'File Folders Pack of 20', sku: 'OFFC-005', category: 'cat-005', brand: 'OrganizeIt', costPrice: 200, sellingPrice: 449, supplier: 'sup-005', warehouse: 'wh-002', stock: 250, minStock: 40, maxStock: 500, reorderPoint: 60, unit: 'packs', barcode: '8901234567040' },
  { name: 'Desk Calculator Scientific', sku: 'OFFC-006', category: 'cat-005', brand: 'CalcPro', costPrice: 300, sellingPrice: 599, supplier: 'sup-005', warehouse: 'wh-003', stock: 120, minStock: 20, maxStock: 250, reorderPoint: 30, unit: 'pcs', barcode: '8901234567041' },
  { name: 'Sticky Notes Neon Pack', sku: 'OFFC-007', category: 'cat-005', brand: 'StickIt', costPrice: 50, sellingPrice: 129, supplier: 'sup-005', warehouse: 'wh-001', stock: 600, minStock: 100, maxStock: 1200, reorderPoint: 150, unit: 'packs', barcode: '8901234567042' },
  { name: 'Stapler Heavy Duty', sku: 'OFFC-008', category: 'cat-005', brand: 'OfficePro', costPrice: 250, sellingPrice: 549, supplier: 'sup-005', warehouse: 'wh-004', stock: 80, minStock: 15, maxStock: 160, reorderPoint: 20, unit: 'pcs', barcode: '8901234567043' },
  // Health & Personal Care (cat-006)
  { name: 'Hand Sanitizer 500ml', sku: 'HLTH-001', category: 'cat-006', brand: 'SafeHands', costPrice: 80, sellingPrice: 199, supplier: 'sup-006', warehouse: 'wh-001', stock: 500, minStock: 100, maxStock: 1000, reorderPoint: 150, unit: 'bottles', barcode: '8901234567044', expiryDate: '2027-08-15' },
  { name: 'Digital Thermometer', sku: 'HLTH-002', category: 'cat-006', brand: 'MediCheck', costPrice: 200, sellingPrice: 499, supplier: 'sup-006', warehouse: 'wh-002', stock: 150, minStock: 25, maxStock: 300, reorderPoint: 40, unit: 'pcs', barcode: '8901234567045' },
  { name: 'First Aid Kit Professional', sku: 'HLTH-003', category: 'cat-006', brand: 'CareFirst', costPrice: 500, sellingPrice: 1199, supplier: 'sup-006', warehouse: 'wh-001', stock: 60, minStock: 10, maxStock: 120, reorderPoint: 18, unit: 'kits', barcode: '8901234567046' },
  { name: 'Sunscreen SPF 50 100ml', sku: 'HLTH-004', category: 'cat-006', brand: 'SunShield', costPrice: 150, sellingPrice: 349, supplier: 'sup-006', warehouse: 'wh-003', stock: 200, minStock: 30, maxStock: 400, reorderPoint: 50, unit: 'tubes', barcode: '8901234567047', expiryDate: '2027-11-30' },
  { name: 'Multivitamin Tablets 60ct', sku: 'HLTH-005', category: 'cat-006', brand: 'VitaPlus', costPrice: 300, sellingPrice: 699, supplier: 'sup-006', warehouse: 'wh-002', stock: 250, minStock: 40, maxStock: 500, reorderPoint: 60, unit: 'bottles', barcode: '8901234567048', expiryDate: '2027-05-01' },
  { name: 'Blood Pressure Monitor', sku: 'HLTH-006', category: 'cat-006', brand: 'MediCheck', costPrice: 1200, sellingPrice: 2499, supplier: 'sup-006', warehouse: 'wh-001', stock: 35, minStock: 8, maxStock: 70, reorderPoint: 12, unit: 'pcs', barcode: '8901234567049' },
  { name: 'Face Mask N95 Pack of 10', sku: 'HLTH-007', category: 'cat-006', brand: 'SafeBreath', costPrice: 100, sellingPrice: 249, supplier: 'sup-006', warehouse: 'wh-004', stock: 400, minStock: 80, maxStock: 800, reorderPoint: 120, unit: 'packs', barcode: '8901234567050', expiryDate: '2028-06-01' },
  // Sports & Outdoors (cat-007)
  { name: 'Yoga Mat Premium 6mm', sku: 'SPRT-001', category: 'cat-007', brand: 'FlexFit', costPrice: 400, sellingPrice: 899, supplier: 'sup-007', warehouse: 'wh-003', stock: 120, minStock: 20, maxStock: 250, reorderPoint: 35, unit: 'pcs', barcode: '8901234567051' },
  { name: 'Resistance Band Set', sku: 'SPRT-002', category: 'cat-007', brand: 'FlexFit', costPrice: 300, sellingPrice: 699, supplier: 'sup-007', warehouse: 'wh-001', stock: 180, minStock: 30, maxStock: 360, reorderPoint: 50, unit: 'sets', barcode: '8901234567052' },
  { name: 'Cricket Bat English Willow', sku: 'SPRT-003', category: 'cat-007', brand: 'CricPro', costPrice: 3500, sellingPrice: 6999, supplier: 'sup-007', warehouse: 'wh-002', stock: 25, minStock: 5, maxStock: 50, reorderPoint: 8, unit: 'pcs', barcode: '8901234567053' },
  { name: 'Gym Dumbbell Set 20kg', sku: 'SPRT-004', category: 'cat-007', brand: 'IronGrip', costPrice: 2000, sellingPrice: 3999, supplier: 'sup-007', warehouse: 'wh-001', stock: 40, minStock: 8, maxStock: 80, reorderPoint: 12, unit: 'sets', barcode: '8901234567054' },
  { name: 'Badminton Racket Pair', sku: 'SPRT-005', category: 'cat-007', brand: 'SmashPro', costPrice: 500, sellingPrice: 1199, supplier: 'sup-007', warehouse: 'wh-003', stock: 70, minStock: 10, maxStock: 140, reorderPoint: 18, unit: 'pairs', barcode: '8901234567055' },
  { name: 'Camping Tent 4-Person', sku: 'SPRT-006', category: 'cat-007', brand: 'WildTrail', costPrice: 3000, sellingPrice: 5999, supplier: 'sup-007', warehouse: 'wh-005', stock: 18, minStock: 5, maxStock: 40, reorderPoint: 8, unit: 'pcs', barcode: '8901234567056' },
  { name: 'Sports Water Bottle 1L', sku: 'SPRT-007', category: 'cat-007', brand: 'HydroFlow', costPrice: 150, sellingPrice: 399, supplier: 'sup-007', warehouse: 'wh-001', stock: 300, minStock: 50, maxStock: 600, reorderPoint: 80, unit: 'pcs', barcode: '8901234567057' },
  { name: 'Skipping Rope Adjustable', sku: 'SPRT-008', category: 'cat-007', brand: 'FlexFit', costPrice: 100, sellingPrice: 249, supplier: 'sup-007', warehouse: 'wh-002', stock: 220, minStock: 40, maxStock: 450, reorderPoint: 60, unit: 'pcs', barcode: '8901234567058' },
  // Automotive (cat-008)
  { name: 'Car Phone Mount Magnetic', sku: 'AUTO-001', category: 'cat-008', brand: 'AutoGrip', costPrice: 200, sellingPrice: 499, supplier: 'sup-008', warehouse: 'wh-001', stock: 160, minStock: 30, maxStock: 320, reorderPoint: 45, unit: 'pcs', barcode: '8901234567059' },
  { name: 'Engine Oil 5W-30 4L', sku: 'AUTO-002', category: 'cat-008', brand: 'LubeMax', costPrice: 800, sellingPrice: 1599, supplier: 'sup-008', warehouse: 'wh-005', stock: 100, minStock: 20, maxStock: 200, reorderPoint: 30, unit: 'cans', barcode: '8901234567060', expiryDate: '2028-12-31' },
  { name: 'Car Dash Camera 1080p', sku: 'AUTO-003', category: 'cat-008', brand: 'RoadEye', costPrice: 1800, sellingPrice: 3499, supplier: 'sup-008', warehouse: 'wh-001', stock: 45, minStock: 8, maxStock: 90, reorderPoint: 12, unit: 'pcs', barcode: '8901234567061' },
  { name: 'Tire Inflator Portable', sku: 'AUTO-004', category: 'cat-008', brand: 'AirPump', costPrice: 1200, sellingPrice: 2499, supplier: 'sup-008', warehouse: 'wh-002', stock: 55, minStock: 10, maxStock: 110, reorderPoint: 15, unit: 'pcs', barcode: '8901234567062' },
  { name: 'Car Seat Cover Set', sku: 'AUTO-005', category: 'cat-008', brand: 'ComfortRide', costPrice: 1500, sellingPrice: 2999, supplier: 'sup-008', warehouse: 'wh-004', stock: 30, minStock: 8, maxStock: 60, reorderPoint: 10, unit: 'sets', barcode: '8901234567063' },
  { name: 'LED Headlight Bulbs H4 Pair', sku: 'AUTO-006', category: 'cat-008', brand: 'BrightBeam', costPrice: 600, sellingPrice: 1299, supplier: 'sup-008', warehouse: 'wh-001', stock: 90, minStock: 15, maxStock: 180, reorderPoint: 25, unit: 'pairs', barcode: '8901234567064' },
  { name: 'Car Air Freshener Set', sku: 'AUTO-007', category: 'cat-008', brand: 'FreshDrive', costPrice: 100, sellingPrice: 249, supplier: 'sup-008', warehouse: 'wh-003', stock: 400, minStock: 60, maxStock: 800, reorderPoint: 100, unit: 'sets', barcode: '8901234567065', expiryDate: '2027-07-01' },
  // Books & Media (cat-009)
  { name: 'Business Strategy Handbook', sku: 'BOOK-001', category: 'cat-009', brand: 'PenguinBooks', costPrice: 300, sellingPrice: 599, supplier: 'sup-009', warehouse: 'wh-001', stock: 80, minStock: 15, maxStock: 160, reorderPoint: 25, unit: 'copies', barcode: '8901234567066' },
  { name: 'Programming with Python', sku: 'BOOK-002', category: 'cat-009', brand: 'TechPress', costPrice: 400, sellingPrice: 799, supplier: 'sup-009', warehouse: 'wh-002', stock: 120, minStock: 20, maxStock: 240, reorderPoint: 35, unit: 'copies', barcode: '8901234567067' },
  { name: 'Children\'s Story Collection', sku: 'BOOK-003', category: 'cat-009', brand: 'KidReads', costPrice: 200, sellingPrice: 449, supplier: 'sup-009', warehouse: 'wh-004', stock: 200, minStock: 30, maxStock: 400, reorderPoint: 50, unit: 'copies', barcode: '8901234567068' },
  { name: 'Art & Design Sketchbook', sku: 'BOOK-004', category: 'cat-009', brand: 'CreativeEdge', costPrice: 150, sellingPrice: 349, supplier: 'sup-009', warehouse: 'wh-001', stock: 150, minStock: 25, maxStock: 300, reorderPoint: 40, unit: 'copies', barcode: '8901234567069' },
  { name: 'Self-Help Bestseller Pack', sku: 'BOOK-005', category: 'cat-009', brand: 'MindGrowth', costPrice: 500, sellingPrice: 999, supplier: 'sup-009', warehouse: 'wh-003', stock: 60, minStock: 10, maxStock: 120, reorderPoint: 18, unit: 'sets', barcode: '8901234567070' },
  { name: 'Hindi Literature Classic', sku: 'BOOK-006', category: 'cat-009', brand: 'SahityaPress', costPrice: 250, sellingPrice: 499, supplier: 'sup-009', warehouse: 'wh-002', stock: 100, minStock: 15, maxStock: 200, reorderPoint: 25, unit: 'copies', barcode: '8901234567071' },
  // Tools & Hardware (cat-010)
  { name: 'Power Drill Cordless 18V', sku: 'TOOL-001', category: 'cat-010', brand: 'DrillMax', costPrice: 2500, sellingPrice: 4999, supplier: 'sup-010', warehouse: 'wh-001', stock: 35, minStock: 8, maxStock: 70, reorderPoint: 12, unit: 'pcs', barcode: '8901234567072' },
  { name: 'Screwdriver Set 32pc', sku: 'TOOL-002', category: 'cat-010', brand: 'FixIt', costPrice: 400, sellingPrice: 899, supplier: 'sup-010', warehouse: 'wh-005', stock: 100, minStock: 15, maxStock: 200, reorderPoint: 25, unit: 'sets', barcode: '8901234567073' },
  { name: 'Measuring Tape 8m', sku: 'TOOL-003', category: 'cat-010', brand: 'MeasurePro', costPrice: 100, sellingPrice: 249, supplier: 'sup-010', warehouse: 'wh-001', stock: 250, minStock: 40, maxStock: 500, reorderPoint: 60, unit: 'pcs', barcode: '8901234567074' },
  { name: 'Hammer Claw 500g', sku: 'TOOL-004', category: 'cat-010', brand: 'StrikeForce', costPrice: 200, sellingPrice: 449, supplier: 'sup-010', warehouse: 'wh-003', stock: 80, minStock: 12, maxStock: 160, reorderPoint: 20, unit: 'pcs', barcode: '8901234567075' },
  { name: 'Wrench Set Combination 12pc', sku: 'TOOL-005', category: 'cat-010', brand: 'FixIt', costPrice: 600, sellingPrice: 1299, supplier: 'sup-010', warehouse: 'wh-002', stock: 45, minStock: 8, maxStock: 90, reorderPoint: 12, unit: 'sets', barcode: '8901234567076' },
  { name: 'Safety Goggles Industrial', sku: 'TOOL-006', category: 'cat-010', brand: 'SafeView', costPrice: 150, sellingPrice: 349, supplier: 'sup-010', warehouse: 'wh-004', stock: 300, minStock: 50, maxStock: 600, reorderPoint: 75, unit: 'pcs', barcode: '8901234567077' },
  { name: 'Electric Angle Grinder', sku: 'TOOL-007', category: 'cat-010', brand: 'DrillMax', costPrice: 1800, sellingPrice: 3499, supplier: 'sup-010', warehouse: 'wh-001', stock: 20, minStock: 5, maxStock: 40, reorderPoint: 8, unit: 'pcs', barcode: '8901234567078' },
  { name: 'Tool Box Metal Large', sku: 'TOOL-008', category: 'cat-010', brand: 'StoreAll', costPrice: 800, sellingPrice: 1699, supplier: 'sup-010', warehouse: 'wh-005', stock: 40, minStock: 8, maxStock: 80, reorderPoint: 12, unit: 'pcs', barcode: '8901234567079' },
  // Toys & Games (cat-011)
  { name: 'Building Blocks Set 500pc', sku: 'TOYS-001', category: 'cat-011', brand: 'BlockWorld', costPrice: 800, sellingPrice: 1699, supplier: 'sup-011', warehouse: 'wh-001', stock: 90, minStock: 15, maxStock: 180, reorderPoint: 25, unit: 'sets', barcode: '8901234567080' },
  { name: 'Remote Control Car', sku: 'TOYS-002', category: 'cat-011', brand: 'SpeedKids', costPrice: 600, sellingPrice: 1299, supplier: 'sup-011', warehouse: 'wh-002', stock: 65, minStock: 10, maxStock: 130, reorderPoint: 18, unit: 'pcs', barcode: '8901234567081' },
  { name: 'Board Game Strategy Classic', sku: 'TOYS-003', category: 'cat-011', brand: 'GameTime', costPrice: 400, sellingPrice: 899, supplier: 'sup-011', warehouse: 'wh-001', stock: 110, minStock: 20, maxStock: 220, reorderPoint: 30, unit: 'pcs', barcode: '8901234567082' },
  { name: 'Puzzle 1000 Pieces World Map', sku: 'TOYS-004', category: 'cat-011', brand: 'PuzzleCraft', costPrice: 250, sellingPrice: 549, supplier: 'sup-011', warehouse: 'wh-003', stock: 140, minStock: 25, maxStock: 280, reorderPoint: 35, unit: 'pcs', barcode: '8901234567083' },
  { name: 'Soft Toy Elephant Large', sku: 'TOYS-005', category: 'cat-011', brand: 'CuddlePals', costPrice: 300, sellingPrice: 699, supplier: 'sup-011', warehouse: 'wh-004', stock: 180, minStock: 30, maxStock: 360, reorderPoint: 45, unit: 'pcs', barcode: '8901234567084' },
  { name: 'Educational Tablet for Kids', sku: 'TOYS-006', category: 'cat-011', brand: 'LearnFun', costPrice: 1500, sellingPrice: 2999, supplier: 'sup-011', warehouse: 'wh-001', stock: 50, minStock: 10, maxStock: 100, reorderPoint: 15, unit: 'pcs', barcode: '8901234567085' },
  { name: 'Action Figure Superhero Set', sku: 'TOYS-007', category: 'cat-011', brand: 'HeroWorld', costPrice: 350, sellingPrice: 799, supplier: 'sup-011', warehouse: 'wh-002', stock: 200, minStock: 30, maxStock: 400, reorderPoint: 50, unit: 'sets', barcode: '8901234567086' },
  // Furniture (cat-012)
  { name: 'Office Chair Ergonomic', sku: 'FURN-001', category: 'cat-012', brand: 'SitRight', costPrice: 8000, sellingPrice: 14999, supplier: 'sup-012', warehouse: 'wh-001', stock: 20, minStock: 5, maxStock: 40, reorderPoint: 8, unit: 'pcs', barcode: '8901234567087' },
  { name: 'Computer Desk L-Shape', sku: 'FURN-002', category: 'cat-012', brand: 'WoodCraft', costPrice: 6000, sellingPrice: 11999, supplier: 'sup-012', warehouse: 'wh-003', stock: 12, minStock: 3, maxStock: 25, reorderPoint: 5, unit: 'pcs', barcode: '8901234567088' },
  { name: 'Bookshelf 5-Tier Wooden', sku: 'FURN-003', category: 'cat-012', brand: 'WoodCraft', costPrice: 3500, sellingPrice: 6999, supplier: 'sup-012', warehouse: 'wh-001', stock: 18, minStock: 4, maxStock: 35, reorderPoint: 6, unit: 'pcs', barcode: '8901234567089' },
  { name: 'Folding Table Portable', sku: 'FURN-004', category: 'cat-012', brand: 'FlexiSpace', costPrice: 1500, sellingPrice: 2999, supplier: 'sup-012', warehouse: 'wh-002', stock: 35, minStock: 8, maxStock: 70, reorderPoint: 12, unit: 'pcs', barcode: '8901234567090' },
  { name: 'Storage Cabinet Metal', sku: 'FURN-005', category: 'cat-012', brand: 'StoreAll', costPrice: 4000, sellingPrice: 7999, supplier: 'sup-012', warehouse: 'wh-005', stock: 10, minStock: 3, maxStock: 20, reorderPoint: 5, unit: 'pcs', barcode: '8901234567091' },
  { name: 'Bean Bag XL Premium', sku: 'FURN-006', category: 'cat-012', brand: 'ComfortZone', costPrice: 1800, sellingPrice: 3499, supplier: 'sup-012', warehouse: 'wh-004', stock: 25, minStock: 5, maxStock: 50, reorderPoint: 8, unit: 'pcs', barcode: '8901234567092' },
  { name: 'TV Stand Modern 55"', sku: 'FURN-007', category: 'cat-012', brand: 'WoodCraft', costPrice: 3000, sellingPrice: 5999, supplier: 'sup-012', warehouse: 'wh-001', stock: 15, minStock: 4, maxStock: 30, reorderPoint: 6, unit: 'pcs', barcode: '8901234567093' },
  { name: 'Shoe Rack 4-Tier', sku: 'FURN-008', category: 'cat-012', brand: 'FlexiSpace', costPrice: 800, sellingPrice: 1699, supplier: 'sup-012', warehouse: 'wh-003', stock: 60, minStock: 10, maxStock: 120, reorderPoint: 18, unit: 'pcs', barcode: '8901234567094' },
  // More Electronics
  { name: 'Smart Watch Fitness', sku: 'ELEC-011', category: 'cat-001', brand: 'FitTrack', costPrice: 2000, sellingPrice: 3999, supplier: 'sup-001', warehouse: 'wh-002', stock: 55, minStock: 10, maxStock: 110, reorderPoint: 18, unit: 'pcs', barcode: '8901234567095' },
  { name: 'Bluetooth Speaker Portable', sku: 'ELEC-012', category: 'cat-001', brand: 'SoundMax', costPrice: 1000, sellingPrice: 2199, supplier: 'sup-001', warehouse: 'wh-001', stock: 80, minStock: 15, maxStock: 160, reorderPoint: 25, unit: 'pcs', barcode: '8901234567096' },
  { name: 'USB Hub 7-Port', sku: 'ELEC-013', category: 'cat-001', brand: 'ConnectAll', costPrice: 500, sellingPrice: 999, supplier: 'sup-013', warehouse: 'wh-003', stock: 110, minStock: 20, maxStock: 220, reorderPoint: 30, unit: 'pcs', barcode: '8901234567097' },
  { name: 'HDMI Cable 2m 4K', sku: 'ELEC-014', category: 'cat-001', brand: 'CableMax', costPrice: 150, sellingPrice: 349, supplier: 'sup-013', warehouse: 'wh-001', stock: 400, minStock: 60, maxStock: 800, reorderPoint: 100, unit: 'pcs', barcode: '8901234567098' },
  { name: 'Wireless Charging Pad', sku: 'ELEC-015', category: 'cat-001', brand: 'PowerPlus', costPrice: 600, sellingPrice: 1299, supplier: 'sup-001', warehouse: 'wh-002', stock: 130, minStock: 20, maxStock: 260, reorderPoint: 35, unit: 'pcs', barcode: '8901234567099' },
  // More Home
  { name: 'Dinner Plate Set 12pc', sku: 'HOME-010', category: 'cat-004', brand: 'TableFine', costPrice: 600, sellingPrice: 1299, supplier: 'sup-004', warehouse: 'wh-001', stock: 45, minStock: 8, maxStock: 90, reorderPoint: 12, unit: 'sets', barcode: '8901234567100' },
  { name: 'Curtains Blackout Pair', sku: 'HOME-011', category: 'cat-004', brand: 'DreamWeave', costPrice: 500, sellingPrice: 1099, supplier: 'sup-004', warehouse: 'wh-002', stock: 75, minStock: 12, maxStock: 150, reorderPoint: 20, unit: 'pairs', barcode: '8901234567101' },
  { name: 'Wall Clock Modern Design', sku: 'HOME-012', category: 'cat-004', brand: 'TimePiece', costPrice: 350, sellingPrice: 799, supplier: 'sup-004', warehouse: 'wh-003', stock: 90, minStock: 15, maxStock: 180, reorderPoint: 22, unit: 'pcs', barcode: '8901234567102' },
  // More Health
  { name: 'Pulse Oximeter Fingertip', sku: 'HLTH-008', category: 'cat-006', brand: 'MediCheck', costPrice: 600, sellingPrice: 1299, supplier: 'sup-006', warehouse: 'wh-001', stock: 75, minStock: 12, maxStock: 150, reorderPoint: 20, unit: 'pcs', barcode: '8901234567103' },
  { name: 'Resistance Loop Bands Set', sku: 'SPRT-009', category: 'cat-007', brand: 'FlexFit', costPrice: 200, sellingPrice: 499, supplier: 'sup-007', warehouse: 'wh-004', stock: 160, minStock: 25, maxStock: 320, reorderPoint: 40, unit: 'sets', barcode: '8901234567104' },
  { name: 'Cycling Helmet Adult', sku: 'SPRT-010', category: 'cat-007', brand: 'SafeRide', costPrice: 800, sellingPrice: 1699, supplier: 'sup-007', warehouse: 'wh-001', stock: 30, minStock: 6, maxStock: 60, reorderPoint: 10, unit: 'pcs', barcode: '8901234567105' },
  { name: 'Car Vacuum Cleaner Handheld', sku: 'AUTO-008', category: 'cat-008', brand: 'CleanDrive', costPrice: 1000, sellingPrice: 2199, supplier: 'sup-008', warehouse: 'wh-002', stock: 50, minStock: 10, maxStock: 100, reorderPoint: 15, unit: 'pcs', barcode: '8901234567106' },
  { name: 'Standing Desk Converter', sku: 'FURN-009', category: 'cat-012', brand: 'SitRight', costPrice: 5000, sellingPrice: 9999, supplier: 'sup-012', warehouse: 'wh-001', stock: 8, minStock: 3, maxStock: 20, reorderPoint: 5, unit: 'pcs', barcode: '8901234567107' },
  { name: 'Pliers Set 3-Piece', sku: 'TOOL-009', category: 'cat-010', brand: 'FixIt', costPrice: 300, sellingPrice: 649, supplier: 'sup-010', warehouse: 'wh-003', stock: 70, minStock: 12, maxStock: 140, reorderPoint: 18, unit: 'sets', barcode: '8901234567108' },
  { name: 'Chess Set Wooden Premium', sku: 'TOYS-008', category: 'cat-011', brand: 'GameTime', costPrice: 500, sellingPrice: 1099, supplier: 'sup-011', warehouse: 'wh-001', stock: 45, minStock: 8, maxStock: 90, reorderPoint: 12, unit: 'sets', barcode: '8901234567109' },
  { name: 'Notebook Spiral A5 5-Pack', sku: 'OFFC-009', category: 'cat-005', brand: 'WriteSmooth', costPrice: 100, sellingPrice: 249, supplier: 'sup-005', warehouse: 'wh-004', stock: 500, minStock: 80, maxStock: 1000, reorderPoint: 120, unit: 'packs', barcode: '8901234567110' },
];

export function generateProducts() {
  return productData.map((p, idx) => ({
    id: `prod-${String(idx + 1).padStart(3, '0')}`,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode || '',
    description: `High quality ${p.name.toLowerCase()} from ${p.brand}`,
    brand: p.brand,
    categoryId: p.category,
    image: p.image || '',
    costPrice: p.costPrice,
    sellingPrice: p.sellingPrice,
    taxPercent: 18,
    stock: p.stock,
    minStock: p.minStock,
    maxStock: p.maxStock,
    reorderPoint: p.reorderPoint,
    warehouseId: p.warehouse,
    supplierId: p.supplier,
    supplierSku: p.sku,
    unit: p.unit || 'pcs',
    status: p.stock === 0 ? 'out_of_stock' : p.stock <= p.reorderPoint ? 'low_stock' : 'active',
    expiryDate: p.expiryDate || null,
    tags: [],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  }));
}

// ============ STOCK MOVEMENTS ============
export function generateMovements(products) {
  const movements = [];
  const types = ['purchase_received', 'sales_issued', 'stock_adjustment', 'warehouse_transfer', 'stock_return'];
  const now = new Date('2026-11-13T10:00:00Z');

  let movId = 1;
  products.forEach((product, pIdx) => {
    const numMovements = 1 + (pIdx % 3);
    for (let i = 0; i < numMovements; i++) {
      const daysAgo = Math.floor((pIdx * 3 + i * 7) % 90);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      const type = types[(pIdx + i) % types.length];
      const qty = 5 + ((pIdx * 7 + i * 3) % 50);
      const prevBalance = product.stock + (type === 'sales_issued' ? qty : -qty);

      movements.push({
        id: `mov-${String(movId++).padStart(4, '0')}`,
        date: date.toISOString(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        warehouseId: product.warehouseId,
        type,
        quantity: type === 'sales_issued' ? -qty : qty,
        previousBalance: Math.max(0, prevBalance),
        newBalance: product.stock,
        reference: `REF-${String(movId).padStart(5, '0')}`,
        notes: `${type.replace(/_/g, ' ')} for ${product.name}`,
        createdAt: date.toISOString(),
      });
    }
  });
  return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ============ PURCHASE ORDERS ============
export function generatePurchaseOrders(products, suppliers) {
  const orders = [];
  const statuses = ['received', 'received', 'sent', 'partially_received', 'draft', 'received', 'sent', 'cancelled'];
  const now = new Date('2026-11-13T10:00:00Z');

  for (let i = 0; i < 50; i++) {
    const supplier = suppliers[i % suppliers.length];
    const supplierProducts = products.filter(p => p.supplierId === supplier.id);
    const numItems = 1 + (i % 4);
    const items = [];
    for (let j = 0; j < numItems && j < supplierProducts.length; j++) {
      const prod = supplierProducts[j % supplierProducts.length];
      const qty = 10 + (i * 3 + j * 5) % 50;
      const received = statuses[i % statuses.length] === 'received' ? qty :
                       statuses[i % statuses.length] === 'partially_received' ? Math.floor(qty / 2) : 0;
      items.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: qty,
        receivedQuantity: received,
        unitPrice: prod.costPrice,
        tax: 18,
        discount: i % 5 === 0 ? 5 : 0,
        total: qty * prod.costPrice,
      });
    }

    const daysAgo = i * 2;
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
    const expectedDate = new Date(orderDate);
    expectedDate.setDate(expectedDate.getDate() + 7 + (i % 14));
    const subtotal = items.reduce((sum, it) => sum + it.total, 0);
    const taxAmount = subtotal * 0.18;
    const discountAmount = items.reduce((sum, it) => sum + (it.total * it.discount / 100), 0);

    orders.push({
      id: `po-${String(i + 1).padStart(4, '0')}`,
      poNumber: `PO-2026-${String(i + 1).padStart(4, '0')}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      orderDate: orderDate.toISOString(),
      expectedDate: expectedDate.toISOString(),
      warehouseId: ['wh-001', 'wh-002', 'wh-003', 'wh-004', 'wh-005'][i % 5],
      items,
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal: subtotal + taxAmount - discountAmount,
      status: statuses[i % statuses.length],
      notes: `Purchase order for ${supplier.name}`,
      createdAt: orderDate.toISOString(),
      updatedAt: orderDate.toISOString(),
    });
  }
  return orders;
}

// ============ SALES ============
export function generateSales(products) {
  const sales = [];
  const now = new Date('2026-11-13T10:00:00Z');

  for (let i = 0; i < 100; i++) {
    const numItems = 1 + (i % 3);
    const items = [];
    for (let j = 0; j < numItems; j++) {
      const prodIdx = (i * 3 + j * 7) % products.length;
      const prod = products[prodIdx];
      const qty = 1 + (i + j) % 10;
      items.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: qty,
        unitPrice: prod.sellingPrice,
        costPrice: prod.costPrice,
        tax: 18,
        discount: i % 7 === 0 ? 10 : i % 5 === 0 ? 5 : 0,
        total: qty * prod.sellingPrice,
      });
    }

    const daysAgo = Math.floor(i * 0.9);
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    const subtotal = items.reduce((sum, it) => sum + it.total, 0);
    const discountAmount = items.reduce((sum, it) => sum + (it.total * it.discount / 100), 0);
    const taxAmount = (subtotal - discountAmount) * 0.18;

    sales.push({
      id: `sale-${String(i + 1).padStart(4, '0')}`,
      invoiceNumber: `INV-2026-${String(i + 1).padStart(4, '0')}`,
      date: saleDate.toISOString(),
      warehouseId: ['wh-001', 'wh-002', 'wh-003', 'wh-004', 'wh-005'][i % 5],
      items,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal: subtotal - discountAmount + taxAmount,
      customerName: `Customer ${i + 1}`,
      status: i % 20 === 0 ? 'returned' : 'completed',
      notes: '',
      createdAt: saleDate.toISOString(),
    });
  }
  return sales;
}

// ============ GENERATE ALL SEED DATA ============
export function generateAllSeedData() {
  const products = generateProducts();
  const movements = generateMovements(products);
  const purchaseOrders = generatePurchaseOrders(products, seedSuppliers);
  const sales = generateSales(products);

  return {
    categories: seedCategories,
    warehouses: seedWarehouses,
    suppliers: seedSuppliers,
    products,
    movements,
    purchaseOrders,
    sales,
    settings: {
      businessName: 'StockWise Inventory Solutions',
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'dd/MM/yyyy',
      lowStockThreshold: 1.0,
      expiryWarningDays: 30,
      theme: 'light',
      notifications: { lowStock: true, outOfStock: true, overstock: true, expiring: true, delayedPO: true },
    },
  };
}
