import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './helpers';

export function generatePDF({ title, subtitle, columns, data, filename, summary }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text('StockWise', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Inventory Intelligence Platform', 14, 27);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 40);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 48);
  }

  // Date
  doc.setFontSize(9);
  doc.text(`Generated: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - 14, 20, { align: 'right' });

  // Summary KPIs
  let startY = subtitle ? 55 : 50;
  if (summary && summary.length > 0) {
    doc.setFontSize(10);
    summary.forEach((item, idx) => {
      doc.setTextColor(100, 116, 139);
      doc.text(`${item.label}:`, 14 + (idx % 3) * 60, startY + Math.floor(idx / 3) * 8);
      doc.setTextColor(15, 23, 42);
      doc.text(String(item.value), 14 + (idx % 3) * 60 + 2 + doc.getTextWidth(`${item.label}: `), startY + Math.floor(idx / 3) * 8);
    });
    startY += Math.ceil(summary.length / 3) * 8 + 5;
  }

  // Table
  if (columns && data) {
    doc.autoTable({
      head: [columns.map(c => c.header)],
      body: data.map(row => columns.map(c => c.accessor ? c.accessor(row) : row[c.key] || '')),
      startY,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
      styles: { cellPadding: 3, overflow: 'linebreak' },
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    doc.text('StockWise Inventory Intelligence', 14, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(filename || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
}

export function generateInvoicePDF({ invoice, type = 'sale', businessName = 'StockWise Inventory Solutions' }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text(businessName, 14, 22);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(type === 'sale' ? 'SALES INVOICE' : 'PURCHASE ORDER', pageWidth - 14, 22, { align: 'right' });

  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const ref = type === 'sale' ? invoice.invoiceNumber : invoice.poNumber;
  doc.text(`${type === 'sale' ? 'Invoice' : 'PO'} #: ${ref}`, pageWidth - 14, 32, { align: 'right' });
  doc.text(`Date: ${formatDate(invoice.date || invoice.orderDate)}`, pageWidth - 14, 39, { align: 'right' });

  if (type === 'purchase') {
    doc.text(`Supplier: ${invoice.supplierName || ''}`, 14, 45);
    doc.text(`Expected Delivery: ${formatDate(invoice.expectedDate)}`, 14, 52);
  } else {
    doc.text(`Customer: ${invoice.customerName || 'Walk-in Customer'}`, 14, 45);
  }

  // Items table
  const items = invoice.items || [];
  doc.autoTable({
    head: [['#', 'Product', 'SKU', 'Qty', 'Unit Price', 'Tax %', 'Discount %', 'Total']],
    body: items.map((item, idx) => [
      idx + 1,
      item.productName,
      item.sku,
      item.quantity,
      formatCurrency(item.unitPrice),
      `${item.tax || 0}%`,
      `${item.discount || 0}%`,
      formatCurrency(item.total),
    ]),
    startY: type === 'purchase' ? 60 : 55,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', pageWidth - 80, finalY);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - 14, finalY, { align: 'right' });

  doc.setTextColor(100, 116, 139);
  doc.text('Tax:', pageWidth - 80, finalY + 7);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(invoice.taxAmount), pageWidth - 14, finalY + 7, { align: 'right' });

  doc.setTextColor(100, 116, 139);
  doc.text('Discount:', pageWidth - 80, finalY + 14);
  doc.setTextColor(15, 23, 42);
  doc.text(`-${formatCurrency(invoice.discountAmount || 0)}`, pageWidth - 14, finalY + 14, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(pageWidth - 80, finalY + 18, pageWidth - 14, finalY + 18);

  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('Grand Total:', pageWidth - 80, finalY + 25);
  doc.text(formatCurrency(invoice.grandTotal), pageWidth - 14, finalY + 25, { align: 'right' });

  const filename = type === 'sale'
    ? `invoice_${invoice.invoiceNumber}.pdf`
    : `po_${invoice.poNumber}.pdf`;
  doc.save(filename);
}
