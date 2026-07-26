import React from 'react';
import { FileSpreadsheet, Layers, Plus } from 'lucide-react';
import type { RabData } from '../../utils/rabParser';

interface BoqTabProps {
  data: RabData;
  formatRupiah: (val: number) => string;
  setActiveTab: (tab: string) => void;
  setExpandedAhs: (ahs: string | null) => void;
  boqViewMode: 'grid' | 'card';
  setBoqViewMode: (mode: 'grid' | 'card') => void;
  boqItemCount: number;

  editingBoqRapNo: string | null;
  setEditingBoqRapNo: (no: string | null) => void;
  editingBoqRapValue: string;
  setEditingBoqRapValue: (val: string) => void;

  editingBoqVolNo: string | null;
  setEditingBoqVolNo: (no: string | null) => void;
  editingBoqVolValue: string;
  setEditingBoqVolValue: (val: string) => void;

  editingBoqPriceNo: string | null;
  setEditingBoqPriceNo: (no: string | null) => void;
  editingBoqPriceValue: string;
  setEditingBoqPriceValue: (val: string) => void;

  handleBoqRapChange: (no: string, val: number) => void;
  handleBoqVolChange: (no: string, val: number) => void;
  handleBoqPriceChange: (no: string, val: number) => void;

  handleAutoFillRap: () => void;
  handleResetRap: () => void;

  setShowAddDivisionModal: (show: boolean) => void;
  setShowAddBoqModal: (show: boolean) => void;
  setSelectedDivForBoq: (div: string) => void;
}

export const BoqTab: React.FC<BoqTabProps> = ({
  data,
  formatRupiah,
  setActiveTab,
  setExpandedAhs,
  boqViewMode,
  setBoqViewMode,
  boqItemCount,
  editingBoqRapNo,
  setEditingBoqRapNo,
  editingBoqRapValue,
  setEditingBoqRapValue,
  editingBoqVolNo,
  setEditingBoqVolNo,
  editingBoqVolValue,
  setEditingBoqVolValue,
  editingBoqPriceNo,
  setEditingBoqPriceNo,
  editingBoqPriceValue,
  setEditingBoqPriceValue,
  handleBoqRapChange,
  handleBoqVolChange,
  handleBoqPriceChange,
  handleAutoFillRap,
  handleResetRap,
  setShowAddDivisionModal,
  setShowAddBoqModal,
  setSelectedDivForBoq
}) => {
  return (
    <div className="space-y-4 tab-slide-fade">
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Daftar Rincian Kuantitas &amp; Harga (Bill of Quantities)</h3>
          
          <div className="flex flex-wrap items-center gap-2 no-print">
            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded font-bold">{boqItemCount} Item Pekerjaan</span>
            
            {/* View mode toggle switch */}
            <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50 mr-1.5 shrink-0">
              <button
                onClick={() => setBoqViewMode('grid')}
                className={`p-1.5 rounded-md flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                  boqViewMode === 'grid' 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-850'
                }`}
                title="Tampilan Grid Spreadsheet Excel"
                type="button"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Grid
              </button>
              <button
                onClick={() => setBoqViewMode('card')}
                className={`p-1.5 rounded-md flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                  boqViewMode === 'card' 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-850'
                }`}
                title="Tampilan Modul Kartu Visual"
                type="button"
              >
                <Layers className="h-3.5 w-3.5" />
                Kartu
              </button>
            </div>

            <button 
              onClick={handleAutoFillRap}
              className="saas-button-secondary cursor-pointer py-1.5 px-3.5 text-[10.5px] border-amber-300 text-amber-850 hover:bg-amber-50"
              type="button"
              title="Isi RAP otomatis untuk semua item berdasarkan HSD dan Koefisien AHSP"
            >
              Isi Otomatis RAP
            </button>

            <button 
              onClick={handleResetRap}
              className="saas-button-secondary cursor-pointer py-1.5 px-3.5 text-[10.5px] text-red-650 border-red-200 hover:bg-red-50"
              type="button"
              title="Reset semua harga RAP manual kembali ke estimasi default"
            >
              Reset RAP
            </button>
            
            <button 
              onClick={() => setShowAddDivisionModal(true)}
              className="saas-button-secondary cursor-pointer py-1.5 px-3 text-[10.5px] flex items-center gap-1"
              type="button"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Divisi
            </button>

            {data.rekap.length > 0 && (
              <button 
                onClick={() => {
                  setSelectedDivForBoq(data.rekap[0].description);
                  setShowAddBoqModal(true);
                }}
                className="saas-button cursor-pointer py-1.5 px-3 text-[10.5px] flex items-center gap-1"
                type="button"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Pekerjaan
              </button>
            )}
          </div>
        </div>
        
        {boqViewMode === 'grid' ? (
          <div className="spreadsheet-container max-h-[550px] overflow-y-auto">
            <table className="spreadsheet-table">
              <thead>
                <tr className="sticky top-0 z-10">
                  <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                  <th>Uraian Pekerjaan</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Satuan</th>
                  <th style={{ width: '85px', textAlign: 'right' }}>Volume</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>Harga RAB</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Total RAB</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Harga RAP</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Total RAP</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Margin</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>AHS</th>
                </tr>
              </thead>
              <tbody>
                {data.boq.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">
                      Belum ada divisi atau pekerjaan. Silakan klik "Tambah Divisi" untuk memulai penyusunan RAB.
                    </td>
                  </tr>
                ) : (
                  data.boq.map((item, idx) => {
                    if (item.isHeader) {
                      return (
                        <tr key={idx} className="division-row-accent font-bold border-t border-b border-slate-350">
                          <td style={{ textAlign: 'center' }} className="text-slate-950 font-black">{item.no}</td>
                          <td colSpan={9} className="text-slate-950 uppercase tracking-wider text-[10.5px] font-black py-3.5 pl-3">
                            {item.description}
                          </td>
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
                    const marginCost = item.unitPrice - rapPrice;
                    const marginPercent = item.unitPrice > 0 ? (marginCost / item.unitPrice) * 100 : 0;

                    return (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center' }} className="text-slate-500 font-medium">{item.no}</td>
                        <td className="pl-6 text-slate-900 font-medium">{item.description}</td>
                        <td style={{ textAlign: 'center' }} className="text-slate-500 font-semibold">{item.unit}</td>
                        
                        {/* Volume (Inline editable) */}
                        <td style={{ textAlign: 'right' }} className="align-middle">
                          {editingBoqVolNo === item.no ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editingBoqVolValue}
                              onChange={(e) => setEditingBoqVolValue(e.target.value)}
                              onBlur={() => {
                                handleBoqVolChange(item.no, parseFloat(editingBoqVolValue) || 0);
                                setEditingBoqVolNo(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleBoqVolChange(item.no, parseFloat(editingBoqVolValue) || 0);
                                  setEditingBoqVolNo(null);
                                } else if (e.key === 'Escape') {
                                  setEditingBoqVolNo(null);
                                }
                              }}
                              className="w-20 text-right bg-amber-50 dark:bg-slate-800 border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-550"
                              autoFocus
                            />
                          ) : (
                            <div
                              onClick={() => {
                                setEditingBoqVolNo(item.no);
                                setEditingBoqVolValue(String(item.volume));
                              }}
                              className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer border-b border-dashed border-slate-350 hover:border-amber-500 pb-0.5 inline-block text-right"
                              title="Klik untuk ubah Volume"
                            >
                              {item.volume.toLocaleString('id-ID')}
                            </div>
                          )}
                        </td>

                        {/* Harga RAB (Inline editable for manual items) */}
                        <td style={{ textAlign: 'right' }} className="align-middle">
                          {!item.ahsCode ? (
                            editingBoqPriceNo === item.no ? (
                              <input
                                type="number"
                                value={editingBoqPriceValue}
                                onChange={(e) => setEditingBoqPriceValue(e.target.value)}
                                onBlur={() => {
                                  handleBoqPriceChange(item.no, parseFloat(editingBoqPriceValue) || 0);
                                  setEditingBoqPriceNo(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleBoqPriceChange(item.no, parseFloat(editingBoqPriceValue) || 0);
                                    setEditingBoqPriceNo(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingBoqPriceNo(null);
                                  }
                                }}
                                className="w-24 text-right bg-amber-50 dark:bg-slate-800 border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-550"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingBoqPriceNo(item.no);
                                  setEditingBoqPriceValue(String(item.unitPrice));
                                }}
                                className="text-slate-700 dark:text-slate-300 cursor-pointer border-b border-dashed border-slate-300 hover:border-amber-500 pb-0.5 inline-block text-right"
                                title="Klik untuk ubah Harga Satuan Manual"
                              >
                                {formatRupiah(item.unitPrice)}
                              </div>
                            )
                          ) : (
                            <span className="text-slate-500 font-medium">{formatRupiah(item.unitPrice)}</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }} className="font-bold text-slate-800 dark:text-slate-200">
                          {formatRupiah(item.totalPrice)}
                        </td>
                        
                        {/* Harga RAP (Inline editable) */}
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
                              title="Klik untuk ubah Harga RAP lapangan manual"
                            >
                              {formatRupiah(rapPrice)}
                            </div>
                          )}
                        </td>
                        
                        <td style={{ textAlign: 'right' }} className="font-extrabold text-blue-900">
                          {formatRupiah(totalRapItem)}
                        </td>
                        
                        {/* Margin % badge */}
                        <td style={{ textAlign: 'center' }}>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            marginPercent >= 12 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            marginPercent >= 8 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            marginPercent >= 0 ? 'bg-amber-50 text-amber-700 border border-amber-500' :
                            'bg-red-50 text-red-700 border border-red-300'
                          }`}>
                            {marginPercent.toFixed(1)}%
                          </span>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          {item.ahsCode ? (
                            <span 
                              onClick={() => {
                                setActiveTab('ahsp');
                                setExpandedAhs(item.ahsCode || null);
                              }}
                              className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white cursor-pointer font-bold transition-all"
                            >
                              {item.ahsCode}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          // Card-based view grouped by division
          <div className="space-y-6 max-h-[550px] overflow-y-auto pr-1">
            {data.rekap.length === 0 ? (
              <div className="text-center text-slate-400 font-bold py-12 bg-slate-50 border border-slate-200 rounded-xl">
                Belum ada divisi atau pekerjaan. Silakan klik "Tambah Divisi" untuk memulai penyusunan RAB.
              </div>
            ) : (
              data.rekap.map((divItem, divIdx) => {
                const boqHeaderIndex = data.boq.findIndex(b => b.isHeader && b.description.toLowerCase().includes(divItem.description.toLowerCase()));
                const divisionItems: any[] = [];
                
                if (boqHeaderIndex !== -1) {
                  for (let i = boqHeaderIndex + 1; i < data.boq.length; i++) {
                    if (data.boq[i].isHeader) break;
                    divisionItems.push(data.boq[i]);
                  }
                }

                return (
                  <div key={divIdx} className="saas-card bg-white border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-amber-500">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg">
                          DIVISI {divItem.no}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                          {divItem.description}
                        </h4>
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        Total RAB: <strong className="text-slate-800 font-black">{formatRupiah(divItem.totalPrice)}</strong>
                      </div>
                    </div>

                    <div className="p-5">
                      {divisionItems.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs py-4 font-bold">
                          Belum ada pekerjaan di divisi ini. Klik "Tambah Pekerjaan" di atas untuk menambahkan.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {divisionItems.map((item, itemIdx) => {
                            // Calculate RAP price
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
                            const marginCost = item.unitPrice - rapPrice;
                            const marginPercent = item.unitPrice > 0 ? (marginCost / item.unitPrice) * 100 : 0;

                            return (
                              <div key={itemIdx} className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl space-y-3 transition-colors shadow-sm relative group">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="min-w-0 flex-grow">
                                    <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded mr-1.5 inline-block shrink-0">
                                      Item {item.no}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800 break-words">{item.description}</span>
                                  </div>
                                  {item.ahsCode && (
                                    <span 
                                      onClick={() => {
                                        setActiveTab('ahsp');
                                        setExpandedAhs(item.ahsCode || null);
                                      }}
                                      className="text-[9.5px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-600 hover:text-white shrink-0 transition-colors"
                                      title="Klik untuk lihat analisa AHSP"
                                    >
                                      {item.ahsCode}
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-200/60 py-2 text-[11px] font-medium">
                                  <div>
                                    <div className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold mb-0.5">Struktur RAB</div>
                                    <span>Volume: <strong className="text-slate-700 font-bold">{item.volume} {item.unit}</strong></span>
                                    <div className="mt-0.5">Harga: <strong className="text-slate-800">{formatRupiah(item.unitPrice)}</strong></div>
                                    <div className="mt-0.5 text-xs font-black text-slate-900">Total: {formatRupiah(item.totalPrice)}</div>
                                  </div>
                                  <div className="border-l border-slate-200 pl-4">
                                    <div className="text-[9px] text-blue-500 uppercase tracking-wider font-extrabold mb-0.5">Struktur RAP</div>
                                    <div className="text-xs font-bold text-blue-900">Harga: {formatRupiah(rapPrice)}</div>
                                    <div className="mt-0.5 text-xs font-black text-blue-900">Total: {formatRupiah(totalRapItem)}</div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Margin:</span>
                                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                                      marginPercent >= 12 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      marginPercent >= 8 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                      marginPercent >= 0 ? 'bg-amber-50 text-amber-700 border border-amber-450' :
                                      'bg-red-50 text-red-700 border border-red-300'
                                    }`}>
                                      {formatRupiah(marginCost)} ({marginPercent.toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
