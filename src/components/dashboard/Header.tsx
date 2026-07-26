import React from 'react';
import { Printer } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  activeTab: string;
  grandTotal: number;
  handlePrint: () => void;
  formatRupiah: (val: number) => string;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  activeTab,
  grandTotal,
  handlePrint,
  formatRupiah
}) => {
  return (
    <header className="min-h-16 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between px-6 gap-3 shadow-sm no-print">
      <div>
        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
          <span>Estimasi Proyek</span>
          <span className="text-slate-350">/</span>
          <span className="text-slate-500 truncate max-w-[150px]">{projectName}</span>
          <span className="text-slate-350">/</span>
          <span className="text-amber-600 font-bold">
            {activeTab === 'rekap' && 'Rekapitulasi'}
            {activeTab === 'boq' && 'Bill of Quantities'}
            {activeTab === 'ahsp' && 'Analisa Satuan (AHSP)'}
            {activeTab === 'hsd' && 'Harga Dasar (HSD)'}
            {activeTab === 'bom' && 'Kebutuhan Riil (BOM)'}
            {activeTab === 'scurve' && 'Kurva S Penjadwalan'}
            {activeTab === 'margin' && 'Margin & RAP'}
            {activeTab === 'smkk' && 'Penerapan K3'}
            {activeTab === 'settings' && 'Konfigurasi Sistem'}
          </span>
        </div>
        
        <h1 className="text-lg font-black tracking-tight text-slate-800 flex items-center gap-2">
          {activeTab === 'rekap' && <>Rekapitulasi Biaya Proyek</>}
          {activeTab === 'boq' && <>Bill of Quantities (BoQ)</>}
          {activeTab === 'ahsp' && <>Analisa Harga Satuan Pekerjaan (AHSP)</>}
          {activeTab === 'hsd' && <>Database Harga Satuan Dasar (HSD)</>}
          {activeTab === 'bom' && <>Bill of Materials (BOM) Kebutuhan Bahan &amp; Upah</>}
          {activeTab === 'scurve' && <>Kurva S &amp; Jadwal Kerja Proyek</>}
          {activeTab === 'margin' && <>Analisa Margin &amp; RAP Kontrol Biaya (ERP)</>}
          {activeTab === 'smkk' && <>Biaya Penerapan SMKK (K3 Konstruksi)</>}
          {activeTab === 'settings' && <>Konfigurasi &amp; Pengaturan Sistem</>}
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Print Action */}
        <button 
          onClick={handlePrint}
          className="saas-button cursor-pointer py-2 px-3.5 text-[11px]"
          type="button"
        >
          <Printer className="h-3.5 w-3.5" /> Cetak Laporan
        </button>

        {/* Pagu display */}
        <div className="bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2">
          <span className="text-slate-400 font-semibold">TOTAL RAB</span>
          <span className="text-amber-400">{formatRupiah(grandTotal)}</span>
        </div>
      </div>
    </header>
  );
};
