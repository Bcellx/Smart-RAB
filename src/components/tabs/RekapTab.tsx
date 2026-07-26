import React from 'react';
import { DollarSign, Building, TrendingUp, Layers } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import type { RabData } from '../../utils/rabParser';

interface RekapTabProps {
  data: RabData;
  totalProjectCost: number;
  grandTotal: number;
  totalRap: number;
  totalSmkk: number;
  smkkPercent: number;
  vatPercent: number;
  vat: number;
  formatRupiah: (val: number) => string;
  rekapChartData: any;
  rekapChartOptions: any;
  directBreakdownData: any;
  directBreakdownOptions: any;
}

export const RekapTab: React.FC<RekapTabProps> = ({
  data,
  totalProjectCost,
  grandTotal,
  totalRap,
  totalSmkk,
  smkkPercent,
  vatPercent,
  vat,
  formatRupiah,
  rekapChartData,
  rekapChartOptions,
  directBreakdownData,
  directBreakdownOptions
}) => {
  return (
    <div className="space-y-6 tab-slide-fade flex-1 overflow-y-auto pr-1">

      {/* ─── 1. TOP KEY METRICS CARDS (4-Column Grid) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Pagu Fisik */}
        <div className="saas-card p-5 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Subtotal Fisik (RAB)</span>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">{formatRupiah(totalProjectCost)}</h3>
          </div>
        </div>

        {/* Card 2: Grand Total RAB */}
        <div className="saas-card p-5 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Pagu Total (RAB+PPN)</span>
            <h3 className="text-base font-black text-emerald-650 dark:text-emerald-400 mt-0.5">{formatRupiah(grandTotal)}</h3>
          </div>
        </div>

        {/* Card 3: Margin Estimasi */}
        <div className="saas-card p-5 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Estimasi Margin Keuntungan</span>
            {(() => {
              const estProfit = grandTotal - totalRap;
              const estProfitPct = grandTotal > 0 ? (estProfit / grandTotal) * 100 : 0;
              return (
                <h3 className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatRupiah(estProfit)} <span className="text-[10px] font-bold text-slate-400">({estProfitPct.toFixed(1)}%)</span>
                </h3>
              );
            })()}
          </div>
        </div>

        {/* Card 4: Pekerjaan */}
        <div className="saas-card p-5 flex items-center gap-4 bg-white border border-slate-200">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600 dark:text-purple-400 shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Divisi Pekerjaan</span>
            <h3 className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">{data.rekap.length} Bidang Utama</h3>
          </div>
        </div>
      </div>

      {/* ─── 2. CHARTS SECTION (Left: Bar, Right: Doughnut) ─── */}
      {totalProjectCost > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 chart-section">
          <div className="saas-card p-5 lg:col-span-2 bg-white border border-slate-200">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Grafik Sebaran Anggaran per Divisi</h4>
            <div className="h-64 flex items-center justify-center">
              <Bar data={rekapChartData} options={rekapChartOptions} />
            </div>
          </div>
          <div className="saas-card p-5 bg-white border border-slate-200">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Proporsi Anggaran Sumber Daya AHS</h4>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={directBreakdownData} options={directBreakdownOptions} />
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. METADATA INFO & INVOICE RECEIPT BOX (Side by side) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Project Metadata Card (7-cols) */}
        <div className="saas-card p-6 bg-white border border-slate-200 lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Detail Administrasi Proyek</h3>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                <span className="text-xs font-bold text-slate-400">Nama Paket Konstruksi</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 text-right">{data.projectName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                <span className="text-xs font-bold text-slate-400">Lokasi / Wilayah</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">{data.location}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                <span className="text-xs font-bold text-slate-400">Tahun Anggaran (TA)</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">{data.year}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                <span className="text-xs font-bold text-slate-400">Porsi K3 Konstruksi (SMKK)</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 text-right">{formatRupiah(totalSmkk)} ({smkkPercent.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Kepatuhan Standar</span>
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md border border-emerald-200/50">SE NO. 47/SE/DK/2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Receipt Summary Card (5-cols) */}
        <div className="saas-card p-6 bg-slate-900 dark:bg-slate-950 text-white border-none lg:col-span-5 flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-850 pb-2.5 mb-4">Struktur Kontrak RAB</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400">Subtotal Fisik Pekerjaan</span>
                <span className="font-bold text-slate-200">{formatRupiah(totalProjectCost)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-4">
                <span className="font-semibold text-slate-400">Pajak PPN ({vatPercent}%)</span>
                <span className="font-bold text-slate-200">{formatRupiah(vat)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block">Nilai Penawaran</span>
                  <span className="text-xs font-black text-slate-350">GRAND TOTAL RAB</span>
                </div>
                <span className="text-xl font-black text-amber-400">{formatRupiah(grandTotal)}</span>
              </div>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 italic mt-6 border-t border-slate-850 pt-3">
            Nilai ini sudah termasuk pajak pertambahan nilai (PPN) sesuai ketentuan perundangan yang berlaku.
          </div>
        </div>
      </div>

      {/* ─── 4. DETAILED DIVISION LIST CARDS ─── */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Distribusi &amp; Alokasi Anggaran Divisi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.rekap.map((item, idx) => {
            const weight = totalProjectCost > 0 ? (item.totalPrice / totalProjectCost) * 100 : 0;
            return (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-3 transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="inline-block text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Divisi {item.no}
                    </span>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wide leading-tight">
                      {item.description}
                    </h4>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-50 shrink-0">
                    {formatRupiah(item.totalPrice)}
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">
                    <span>Bobot Anggaran</span>
                    <span>{weight.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-250 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${weight}%`, backgroundColor: 'var(--accent-warning)' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
