import React from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

export default function ExportMenu({ onExportCSV, onExportPDF, onPrint }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="btn-secondary btn-sm">
        <Download size={16} />
        Export
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-border shadow-lg z-40 py-1">
            {onExportCSV && (
              <button onClick={() => { onExportCSV(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background-secondary">
                <FileSpreadsheet size={16} className="text-green-600" /> Export CSV
              </button>
            )}
            {onExportPDF && (
              <button onClick={() => { onExportPDF(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background-secondary">
                <FileText size={16} className="text-red-600" /> Export PDF
              </button>
            )}
            {onPrint && (
              <button onClick={() => { onPrint(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background-secondary">
                <FileText size={16} className="text-blue-600" /> Print
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
