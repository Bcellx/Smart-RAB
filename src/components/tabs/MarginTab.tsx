import React from 'react';
import { DollarSign, TrendingUp, Info } from 'lucide-react';
import type { RabData } from '../../utils/rabParser';

interface MarginTabProps {
  data: RabData;
  formatRupiah: (val: number) => string;
  grandTotal: number;
  totalRap: number;
  targetMargin: number;
  setTargetMargin: (margin: number) => void;

  editingBoqRapNo: string | null;
  setEditingBoqRapNo: (no: string | null) => void;
  editingBoqRapValue: string;
  setEditingBoqRapValue: (val: string) => void;

  handleBoqRapChange: (no: string, val: number) => void;
  handleAutoFillRap: () => void;
  handleResetRap: () => void;
}

export const MarginTab: React.FC<MarginTabProps> = ({
  data,
  formatRupiah,
  grandTotal,
  totalRap,
  targetMargin,
  setTargetMargin,
  editingBoqRapNo,
  setEditingBoqRapNo,
  editingBoqRapValue,
  setEditingBoqRapValue,
  handleBoqRapChange,
  handleAutoFillRap,
  handleResetRap
}) => {
  const currentMargin = grandTotal - totalRap;
  const currentMarginPct = grandTotal > 0 ? (currentMargin / grandTotal) * 100 : 0;
  const totalLaborCost = data.boq.reduce((sum, item) => {
    if (item.isHeader) return sum;
    const matchingAhs = data.ahsp.find(ahs => ahs.code === item.ahsCode);
    return sum + (matchingAhs ? matchingAhs.totalLabor * item.volume : 0);
  }, 0);
  
  const totalMaterialCost = data.boq.reduce((sum, item) => {
    if (item.isHeader) return sum;
    const matchingAhs = data.ahsp.find(ahs => ahs.code === item.ahsCode);
    return sum + (matchingAhs ? matchingAhs.totalMaterial * item.volume : 0);
  }, 0);

  const totalEquipmentCost = data.boq.reduce((sum, item) => {
    if (item.isHeader) return sum;
    const matchingAhs = data.ahsp.find(ahs => ahs.code === item.ahsCode);
    return sum + (matchingAhs ? matchingAhs.totalEquipment * item.volume : 0);
  }, 0);

  return (
    <div className="space-y-6 tab-slide-fade">
      {/* 4 Cards Ringkasan ERP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="saas-card p-5 bg-white border border-slate-200 flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">GRAND TOTAL RAB</span>
            <h3 className="text-base font-black text-slate-800 mt-0.5">{formatRupiah(grandTotal)}</h3>
          </div>
        </div>

        <div className="saas-card p-5 bg-white border border-slate-200 flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">TOTAL ANGGARAN RAP</span>
            <h3 className="text-base font-black text-purple-650 mt-0.5">{formatRupiah(totalRap)}</h3>
          </div>
        </div>

        <div className="saas-card p-5 bg-white border border-slate-200 flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">PROYEKSI NET MARGIN</span>
            <h3 className="text-base font-black text-emerald-650 mt-0.5">
              {formatRupiah(currentMargin)} <span className="text-[10px] text-slate-450 font-bold">({currentMarginPct.toFixed(1)}%)</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Target Margin Control & composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="saas-card p-5 bg-white border border-slate-200 lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Target &amp; Sensitivitas Keuntungan Kontraktor</h3>
          
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-500">Minimal Batas Margin Aman Proyek</span>
              <span className="font-black text-slate-800">{targetMargin}%</span>
            </div>
            
            <input 
              type="range" 
              min="5" 
              max="25" 
              value={targetMargin}
              onChange={(e) => setTargetMargin(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>5% (Tinggi Risiko)</span>
              <span>12% (Batas Aman PUPR)</span>
              <span>25% (Sangat Sehat)</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl flex items-start gap-2.5 text-xs">
            <Info className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Jika margin di bawah **{targetMargin}%**, baris pekerjaan di spreadsheet BoQ akan ditandai dengan lencana berwarna kuning/merah sebagai peringatan visual bahwa item tersebut rawan mengalami kerugian di lapangan.
            </p>
          </div>
        </div>

        {/* Anggaran Composition */}
        <div className="saas-card p-5 bg-white border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Komposisi Biaya Langsung Proyek</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Total Upah Tenaga Kerja</span>
                <span className="font-extrabold text-purple-700">{formatRupiah(totalLaborCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Total Bahan / Material</span>
                <span className="font-extrabold text-orange-600">{formatRupiah(totalMaterialCost)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="font-semibold text-slate-400">Total Peralatan</span>
                <span className="font-extrabold text-teal-600">{formatRupiah(totalEquipmentCost)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-slate-800 pt-1">
                <span>Total Estimasi Konstruksi</span>
                <span>{formatRupiah(totalLaborCost + totalMaterialCost + totalEquipmentCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAP spreadsheet actions */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Lembar Kendali Rencana Anggaran Pelaksanaan (RAP)</h3>
          
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button 
              onClick={handleAutoFillRap}
              className="saas-button cursor-pointer py-1.5 px-3.5 text-[10.5px]"
              type="button"
            >
              Kalkulasi Otomatis RAP
            </button>
            <button 
              onClick={handleResetRap}
              className="saas-button-secondary cursor-pointer py-1.5 px-3.5 text-[10.5px] text-red-650 border-red-200 hover:bg-red-50"
              type="button"
            >
              Reset Harga RAP
            </button>
          </div>
        </div>

        <div className="spreadsheet-container max-h-[400px] overflow-y-auto">
          <table className="spreadsheet-table text-xs">
            <thead>
              <tr className="sticky top-0 z-10">
                <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                <th>Uraian Pekerjaan</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Sat.</th>
                <th style={{ width: '85px', textAlign: 'right' }}>Volume</th>
                <th style={{ width: '135px', textAlign: 'right' }}>Harga Satuan RAB</th>
                <th style={{ width: '145px', textAlign: 'right' }}>Harga Satuan RAP</th>
                <th style={{ width: '145px', textAlign: 'right' }}>Subtotal RAP</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Status Margin</th>
              </tr>
            </thead>
            <tbody>
              {data.boq.map((item, idx) => {
                if (item.isHeader) {
                  return (
                    <tr key={idx} className="bg-slate-100 font-bold border-t border-b border-slate-350">
                      <td style={{ textAlign: 'center' }} className="text-slate-900 font-black">{item.no}</td>
                      <td colSpan={7} className="text-slate-950 uppercase tracking-wider text-[10px] font-black pl-3">{item.description}</td>
                    </tr>
                  );
                }

                // Compute RAP price
                let rapPrice = item.rapUnitPrice;
                if (rapPrice === undefined || rapPrice === null) {
                  if (item.ahsCode) {
                    const matchingAhs = data.ahsp.find(ahs => ahs.code === item.ahsCode);
                    if (matchingAhs) {
                      let divLabor = 0;
                      matchingAhs.labor.forEach(l => {
                        const rate = (data.rapLabor || data.labor).find(rl => rl.code === l.code)?.rate ?? l.rate;
                        divLabor += l.coefficient * rate;
                      });
                      let divMaterial = 0;
                      matchingAhs.materials.forEach(m => {
                        const rate = (data.rapMaterials || data.materials).find(rm => rm.code === m.code)?.rate ?? m.rate;
                        divMaterial += m.coefficient * rate;
                      });
                      let divEquip = 0;
                      matchingAhs.equipment.forEach(e => {
                        divEquip += e.coefficient * e.rate;
                      });
                      rapPrice = divLabor + divMaterial + divEquip;
                    }
                  }
                }
                if (rapPrice === undefined || rapPrice === null || rapPrice === 0) {
                  rapPrice = item.unitPrice / 1.15;
                }

                const totalRapItem = rapPrice * item.volume;
                const marginPercent = item.unitPrice > 0 ? ((item.unitPrice - rapPrice) / item.unitPrice) * 100 : 0;

                return (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }} className="text-slate-500 font-medium">{item.no}</td>
                    <td className="pl-6 text-slate-800 font-medium">{item.description}</td>
                    <td style={{ textAlign: 'center' }} className="text-slate-500 font-semibold">{item.unit}</td>
                    <td style={{ textAlign: 'right' }} className="font-semibold text-slate-800">{item.volume.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right' }} className="text-slate-500 font-medium">{formatRupiah(item.unitPrice)}</td>
                    
                    {/* Price edit */}
                    <td style={{ textAlign: 'right' }} className="align-middle">
                      {editingBoqRapNo === item.no ? (
                        <input
                          type="number"
                          value={editingBoqRapValue}
                          onChange={(e) => setEditingBoqRapValue(e.target.value)}
                          onBlur={() => {
                            handleBoqRapChange(item.no, parseFloat(editingBoqRapValue) || 0);
                            setEditingBoqRapNo(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleBoqRapChange(item.no, parseFloat(editingBoqRapValue) || 0);
                              setEditingBoqRapNo(null);
                            } else if (e.key === 'Escape') {
                              setEditingBoqRapNo(null);
                            }
                          }}
                          className="saas-input w-28 text-right text-xs py-1 px-1.5 min-h-[30px]"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setEditingBoqRapNo(item.no);
                            setEditingBoqRapValue(String(Math.round(rapPrice)));
                          }}
                          className="text-blue-800 font-semibold cursor-pointer border-b border-dashed border-blue-350 hover:border-blue-600 pb-0.5 inline-block text-right"
                          title="Klik untuk ubah Harga Satuan RAP"
                        >
                          {formatRupiah(rapPrice)}
                        </div>
                      )}
                    </td>
                    
                    <td style={{ textAlign: 'right' }} className="font-extrabold text-blue-900">{formatRupiah(totalRapItem)}</td>
                    
                    <td style={{ textAlign: 'center' }}>
                      <span className={`text-[9.5px] px-2.5 py-0.5 rounded font-black uppercase tracking-wider ${
                        marginPercent >= targetMargin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        marginPercent >= 0 ? 'bg-amber-50 text-amber-700 border border-amber-450' :
                        'bg-red-50 text-red-700 border border-red-300'
                      }`}>
                        {marginPercent >= targetMargin ? 'Aman' : marginPercent >= 0 ? 'Pas-pasan' : 'Negatif'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
