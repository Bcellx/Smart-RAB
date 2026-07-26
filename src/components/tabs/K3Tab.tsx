import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import type { RabData } from '../../utils/rabParser';

interface K3TabProps {
  data: RabData;
  formatRupiah: (val: number) => string;
  totalSmkk: number;
  smkkPercent: number;

  editingSmkkNo: string | null;
  setEditingSmkkNo: (no: string | null) => void;
  editingSmkkValue: string;
  setEditingSmkkValue: (val: string) => void;

  handleSmkkPriceChange: (no: string, val: number) => void;
}

export const K3Tab: React.FC<K3TabProps> = ({
  data,
  formatRupiah,
  totalSmkk,
  smkkPercent,
  editingSmkkNo,
  setEditingSmkkNo,
  editingSmkkValue,
  setEditingSmkkValue,
  handleSmkkPriceChange
}) => {
  return (
    <div className="space-y-4 tab-slide-fade">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="saas-card p-5 bg-white border border-slate-200 flex items-center gap-4">
          <div className="p-3.5 bg-red-50 text-red-650 rounded-xl shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">TOTAL ANGGARAN K3 (SMKK)</span>
            <h3 className="text-base font-black text-slate-800 mt-0.5">
              {formatRupiah(totalSmkk)} <span className="text-[10px] text-slate-450 font-bold">({smkkPercent.toFixed(2)}% dari Pagu)</span>
            </h3>
          </div>
        </div>

        <div className="saas-card p-5 bg-white border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-slate-700 block mb-0.5">Aturan K3 SMKK Pemerintah</span>
            Berdasarkan Surat Edaran Menteri PUPR No. 47/SE/DK/2026, penyediaan komponen keselamatan konstruksi bersifat wajib di dalam dokumen lelang pekerjaan umum dan tidak boleh dinegosiasikan menjadi nol rupiah.
          </div>
        </div>
      </div>

      <div className="saas-card p-6 bg-white border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Rincian Komponen Keselamatan &amp; Kesehatan Kerja (SMKK)</h3>
        
        <div className="spreadsheet-container max-h-[420px] overflow-y-auto">
          <table className="spreadsheet-table text-xs">
            <thead>
              <tr className="sticky top-0 z-10">
                <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                <th>Deskripsi Item Penerapan K3</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Satuan</th>
                <th style={{ width: '85px', textAlign: 'right' }}>Volume</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Harga Satuan (Rp)</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Jumlah Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {data.smkk.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                    Tidak ada item SMKK terdeteksi dalam berkas.
                  </td>
                </tr>
              ) : (
                data.smkk.map((item, idx) => {
                  if (item.isHeader) {
                    return (
                      <tr key={idx} className="bg-slate-100 font-bold border-t border-b border-slate-350">
                        <td style={{ textAlign: 'center' }} className="text-slate-900 font-black">{item.no}</td>
                        <td colSpan={5} className="text-slate-950 uppercase tracking-wider text-[10px] font-black pl-3">{item.description}</td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center' }} className="text-slate-500 font-medium">{item.no}</td>
                      <td className="pl-6 text-slate-800 font-semibold">{item.description}</td>
                      <td style={{ textAlign: 'center' }} className="text-slate-500 font-semibold">{item.unit}</td>
                      <td style={{ textAlign: 'right' }} className="font-semibold text-slate-700">{item.volume.toLocaleString('id-ID')}</td>
                      
                      {/* Price inline edit */}
                      <td style={{ textAlign: 'right' }} className="align-middle">
                        {editingSmkkNo === item.no ? (
                          <input
                            type="number"
                            value={editingSmkkValue}
                            onChange={(e) => setEditingSmkkValue(e.target.value)}
                            onBlur={() => {
                              handleSmkkPriceChange(item.no, parseFloat(editingSmkkValue) || 0);
                              setEditingSmkkNo(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSmkkPriceChange(item.no, parseFloat(editingSmkkValue) || 0);
                                setEditingSmkkNo(null);
                              } else if (e.key === 'Escape') {
                                setEditingSmkkNo(null);
                              }
                            }}
                            className="w-32 text-right bg-amber-50 dark:bg-slate-800 border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => {
                              setEditingSmkkNo(item.no);
                              setEditingSmkkValue(String(item.unitPrice));
                            }}
                            className="font-semibold text-slate-700 dark:text-slate-355 cursor-pointer border-b border-dashed border-slate-300 hover:border-amber-500 pb-0.5 inline-block text-right"
                            title="Klik untuk ubah Harga SMKK"
                          >
                            {formatRupiah(item.unitPrice)}
                          </div>
                        )}
                      </td>
                      
                      <td style={{ textAlign: 'right' }} className="font-bold text-slate-850">{formatRupiah(item.totalPrice)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
