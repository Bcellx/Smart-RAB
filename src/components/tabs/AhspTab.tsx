import React from 'react';
import { 
  Layers, 
  Search, 
  Plus, 
  ChevronRight, 
  Edit3, 
  FileText, 
  AlertTriangle,
  Users,
  Building 
} from 'lucide-react';

interface AhspTabProps {
  formatRupiah: (val: number) => string;
  expandedAhs: string | null;
  setExpandedAhs: (ahs: string | null) => void;
  filteredAhsp: any[];

  editingAhsComp: { ahsCode: string; type: 'labor' | 'material' | 'equipment'; code: string } | null;
  setEditingAhsComp: (val: any) => void;
  editingAhsCompValue: string;
  setEditingAhsCompValue: (val: string) => void;

  editingAhsOverheadCode: string | null;
  setEditingAhsOverheadCode: (code: string | null) => void;
  editingAhsOverheadValue: string;
  setEditingAhsOverheadValue: (val: string) => void;

  handleAhsCoefficientChange: (ahsCode: string, type: 'labor' | 'material' | 'equipment', compCode: string, newCoeff: number) => void;
  handleAhsOverheadChange: (ahsCode: string, newOverhead: number) => void;

  handleOpenEditAhs: (code: string) => void;
  handleDuplicateAhs: (code: string) => void;
  handleDeleteAhs: (code: string) => void;

  setShowAddAhspModal: (show: boolean) => void;
  ahsSearch: string;
  setAhsSearch: (search: string) => void;
}

export const AhspTab: React.FC<AhspTabProps> = ({
  formatRupiah,
  expandedAhs,
  setExpandedAhs,
  filteredAhsp,
  editingAhsComp,
  setEditingAhsComp,
  editingAhsCompValue,
  setEditingAhsCompValue,
  editingAhsOverheadCode,
  setEditingAhsOverheadCode,
  editingAhsOverheadValue,
  setEditingAhsOverheadValue,
  handleAhsCoefficientChange,
  handleAhsOverheadChange,
  handleOpenEditAhs,
  handleDuplicateAhs,
  handleDeleteAhs,
  setShowAddAhspModal,
  ahsSearch,
  setAhsSearch
}) => {
  return (
    <div className="tab-slide-fade flex flex-col gap-0" style={{ minHeight: 0 }}>
      {/* AHSP TOOLBAR — Search + Stats + Add Button */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        {/* Left: Stats chips */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wide">
              <Layers className="h-3 w-3" /> {filteredAhsp.length} Analisa
            </span>
          </div>
          
          {/* Dynamic Price Range Indicator */}
          {filteredAhsp.length > 0 && (
            <div className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1.5">
              Rentang Analisa: 
              <strong className="text-slate-800">
                {formatRupiah(Math.min(...filteredAhsp.map(a => a.unitPrice)))}
              </strong>
              <span>-</span>
              <strong className="text-slate-800">
                {formatRupiah(Math.max(...filteredAhsp.map(a => a.unitPrice)))}
              </strong>
            </div>
          )}
        </div>

        {/* Right: Search Input + Add Button */}
        <div className="flex items-center gap-3 no-print flex-wrap">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari Analisa AHSP..." 
              value={ahsSearch}
              onChange={(e) => setAhsSearch(e.target.value)}
              className="saas-input pl-search py-1.5 text-xs w-full md:w-56"
            />
          </div>
          <button 
            onClick={() => setShowAddAhspModal(true)}
            className="saas-button cursor-pointer py-1.5 px-3 text-[10.5px] flex items-center gap-1"
            type="button"
          >
            <Plus className="h-3.5 w-3.5 text-slate-950" /> Tambah Analisa
          </button>
        </div>
      </div>

      {/* AHSP ACCORDION TABLE LIST */}
      <div className="bg-white border border-slate-200 rounded-xl mt-4 shadow-sm overflow-hidden flex-1 overflow-y-auto max-h-[550px]">
        {filteredAhsp.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-450 font-extrabold flex flex-col items-center gap-2">
            <Layers className="h-8 w-8 text-slate-300" />
            Belum ada formula analisa. Klik "Tambah Analisa" untuk menyusun AHSP baru.
          </div>
        ) : (
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 sticky top-0 z-10">
                <th className="px-4 py-3 text-center w-[50px]">No</th>
                <th className="px-4 py-3 w-[120px]">Kode AHS</th>
                <th className="px-4 py-3">Deskripsi Pekerjaan Analisa</th>
                <th className="px-4 py-3 text-center w-[70px]">Satuan</th>
                <th className="px-4 py-3 w-[160px]">Komposisi Biaya</th>
                <th className="px-4 py-3 text-right w-[160px]">Harga Satuan</th>
                <th className="px-3 py-3 text-center w-[160px] no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAhsp.map((ahs, idx) => {
                const isExpanded = expandedAhs === ahs.code;
                const totalCost = ahs.directCost || 1;
                const laborPct = (ahs.totalLabor / totalCost) * 100;
                const materialPct = (ahs.totalMaterial / totalCost) * 100;
                const equipPct = (ahs.totalEquipment / totalCost) * 100;
                const isEven = idx % 2 === 1;

                return (
                  <React.Fragment key={`group-${idx}`}>
                    {/* ─── SUMMARY ROW ─── */}
                    <tr
                      onClick={() => setExpandedAhs(isExpanded ? null : ahs.code)}
                      className={`border-b border-slate-100 cursor-pointer transition-colors ${isExpanded ? 'bg-amber-50 border-amber-200' : isEven ? 'bg-slate-50/60 hover:bg-amber-50/40' : 'bg-white hover:bg-amber-50/40'}`}
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-[10px] font-bold text-slate-400 text-center">{idx + 1}</td>

                      {/* Kode */}
                      <td className="px-4 py-3">
                        <span className={`inline-block font-mono text-[10px] font-black px-2 py-0.5 rounded border ${isExpanded ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                          {ahs.code}
                        </span>
                      </td>

                      {/* Nama */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-xs leading-snug">{ahs.name}</div>
                        {/* mini component counts */}
                        <div className="flex gap-2 mt-0.5">
                          {ahs.labor.length > 0 && <span className="text-[9px] text-purple-600 font-bold">{ahs.labor.length} Tenaga</span>}
                          {ahs.materials.length > 0 && <span className="text-[9px] text-orange-600 font-bold">{ahs.materials.length} Bahan</span>}
                          {ahs.equipment.length > 0 && <span className="text-[9px] text-teal-600 font-bold">{ahs.equipment.length} Alat</span>}
                        </div>
                      </td>

                      {/* Satuan */}
                      <td className="px-4 py-3 text-center font-bold text-slate-500">{ahs.unit}</td>

                      {/* Komposisi mini bar */}
                      <td className="px-4 py-3">
                        <div className="h-2 w-full rounded bg-slate-100 overflow-hidden flex border border-slate-200 mb-1">
                          {ahs.totalLabor > 0 && <div style={{ width: `${laborPct}%` }} className="h-full bg-purple-500" title={`Upah: ${Math.round(laborPct)}%`} />}
                          {ahs.totalMaterial > 0 && <div style={{ width: `${materialPct}%` }} className="h-full bg-orange-500" title={`Bahan: ${Math.round(materialPct)}%`} />}
                          {ahs.totalEquipment > 0 && <div style={{ width: `${equipPct}%` }} className="h-full bg-teal-500" title={`Alat: ${Math.round(equipPct)}%`} />}
                        </div>
                        <div className="flex gap-2 text-[8px] font-bold">
                          {ahs.totalLabor > 0 && <span className="text-purple-600">U:{Math.round(laborPct)}%</span>}
                          {ahs.totalMaterial > 0 && <span className="text-orange-600">B:{Math.round(materialPct)}%</span>}
                          {ahs.totalEquipment > 0 && <span className="text-teal-600">A:{Math.round(equipPct)}%</span>}
                        </div>
                      </td>

                      {/* Harga Satuan */}
                      <td className="px-4 py-3 text-right">
                        <div className="font-black text-sm text-amber-600" style={{ color: 'var(--accent-primary)' }}>{formatRupiah(ahs.unitPrice)}</div>
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5">OH: {ahs.overheadPercent}%</div>
                      </td>

                      {/* Aksi: Expand + Edit + Duplicate + Delete */}
                      <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {/* Expand toggle */}
                          <button
                            onClick={() => setExpandedAhs(isExpanded ? null : ahs.code)}
                            title={isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full border transition-all ${isExpanded ? 'bg-amber-500 border-amber-600 text-slate-950' : 'bg-slate-100 border-slate-300 text-slate-400 hover:border-amber-400'}`}
                            type="button"
                          >
                            <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditAhs(ahs.code)}
                            title="Edit Analisa"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
                            type="button"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicateAhs(ahs.code)}
                            title="Duplikat Analisa"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-600 hover:text-white transition-all"
                            type="button"
                          >
                            <FileText className="h-3 w-3" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteAhs(ahs.code)}
                            title="Hapus Analisa"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-red-200 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            type="button"
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ─── EXPANDED DETAIL PANEL (inline row) ─── */}
                    {isExpanded && (
                      <tr key={`expand-${idx}`} className="bg-slate-50 border-b border-amber-200">
                        <td colSpan={7} className="p-0">
                          <div className="px-6 py-4 space-y-3">

                            {/* Proporsi bar — compact */}
                            <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg px-4 py-2.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Proporsi:</span>
                              <div className="flex-1 h-2.5 rounded bg-slate-100 overflow-hidden flex border border-slate-200">
                                {ahs.totalLabor > 0 && <div style={{ width: `${laborPct}%` }} className="h-full bg-purple-500" />}
                                {ahs.totalMaterial > 0 && <div style={{ width: `${materialPct}%` }} className="h-full bg-orange-500" />}
                                {ahs.totalEquipment > 0 && <div style={{ width: `${equipPct}%` }} className="h-full bg-teal-500" />}
                              </div>
                              <div className="flex gap-4 text-xs shrink-0 flex-wrap">
                                {ahs.totalLabor > 0 && (
                                  <span className="flex items-center gap-1.5 text-purple-700 font-bold">
                                    <span className="h-2 w-2 rounded bg-purple-500 inline-block" />
                                    Upah {Math.round(laborPct)}% <span className="font-normal text-slate-500">({formatRupiah(ahs.totalLabor)})</span>
                                  </span>
                                )}
                                {ahs.totalMaterial > 0 && (
                                  <span className="flex items-center gap-1.5 text-orange-700 font-bold">
                                    <span className="h-2 w-2 rounded bg-orange-500 inline-block" />
                                    Bahan {Math.round(materialPct)}% <span className="font-normal text-slate-500">({formatRupiah(ahs.totalMaterial)})</span>
                                  </span>
                                )}
                                {ahs.totalEquipment > 0 && (
                                  <span className="flex items-center gap-1.5 text-teal-700 font-bold">
                                    <span className="h-2 w-2 rounded bg-teal-500 inline-block" />
                                    Alat {Math.round(equipPct)}% <span className="font-normal text-slate-500">({formatRupiah(ahs.totalEquipment)})</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Detail component table */}
                            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wide">
                                    <th className="text-left px-3 py-2 font-bold w-[90px]">Kode</th>
                                    <th className="text-left px-3 py-2 font-bold">Uraian Sumber Daya</th>
                                    <th className="text-center px-3 py-2 font-bold w-[55px]">Sat.</th>
                                    <th className="text-right px-3 py-2 font-bold w-[85px]">Koef.</th>
                                    <th className="text-right px-3 py-2 font-bold w-[130px]">Harga Satuan</th>
                                    <th className="text-right px-3 py-2 font-bold w-[140px]">Jumlah (Rp)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* A. TENAGA KERJA */}
                                  {ahs.labor.length > 0 && (
                                    <>
                                      <tr className="bg-purple-50 border-b border-purple-100">
                                        <td colSpan={6} className="px-3 py-1.5 text-[10px] font-black text-purple-700 uppercase tracking-widest">
                                          <Users className="h-3 w-3 inline-block mr-1.5" />A. Tenaga Kerja
                                        </td>
                                      </tr>
                                      {ahs.labor.map((lab: any, lIdx: number) => (
                                        <tr key={lIdx} className="border-b border-slate-100 hover:bg-purple-50/30">
                                          <td className="px-3 py-2 font-mono text-[10px] text-slate-500 font-bold">{lab.code}</td>
                                          <td className="px-3 py-2 font-semibold text-slate-800">{lab.type || lab.code}</td>
                                          <td className="px-3 py-2 text-center text-slate-500">{lab.unit}</td>
                                          
                                          {/* Labor Coefficient (Inline editable) */}
                                          <td className="px-3 py-2 text-right align-middle">
                                             {editingAhsComp?.ahsCode === ahs.code && editingAhsComp?.type === 'labor' && editingAhsComp?.code === lab.code ? (
                                               <input
                                                 type="number"
                                                 step="0.0001"
                                                 value={editingAhsCompValue}
                                                 onChange={(e) => setEditingAhsCompValue(e.target.value)}
                                                 onBlur={() => {
                                                   handleAhsCoefficientChange(ahs.code, 'labor', lab.code, parseFloat(editingAhsCompValue) || 0);
                                                   setEditingAhsComp(null);
                                                 }}
                                                 onKeyDown={(e) => {
                                                   if (e.key === 'Enter') {
                                                     handleAhsCoefficientChange(ahs.code, 'labor', lab.code, parseFloat(editingAhsCompValue) || 0);
                                                     setEditingAhsComp(null);
                                                   } else if (e.key === 'Escape') {
                                                     setEditingAhsComp(null);
                                                   }
                                                 }}
                                                 className="w-16 text-right bg-amber-50 dark:bg-slate-800 border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                                                 autoFocus
                                               />
                                             ) : (
                                               <div
                                                 onClick={() => {
                                                   setEditingAhsComp({ ahsCode: ahs.code, type: 'labor', code: lab.code });
                                                   setEditingAhsCompValue(String(lab.coefficient));
                                                 }}
                                                 className="font-bold text-slate-700 dark:text-slate-355 cursor-pointer border-b border-dashed border-slate-300 hover:border-amber-500 pb-0.5 inline-block text-right"
                                                 title="Klik untuk ubah Koefisien"
                                               >
                                                 {lab.coefficient.toFixed(4)}
                                               </div>
                                             )}
                                          </td>
                                          
                                          <td className="px-3 py-2 text-right text-slate-600">{formatRupiah(lab.rate)}</td>
                                          <td className="px-3 py-2 text-right font-bold text-slate-900">{formatRupiah(lab.cost)}</td>
                                        </tr>
                                      ))}
                                      <tr className="bg-purple-50/80 border-b border-purple-200">
                                        <td colSpan={5} className="px-3 py-1.5 text-right text-[10px] font-black text-purple-700">Subtotal Upah Tenaga (A)</td>
                                        <td className="px-3 py-1.5 text-right font-black text-purple-800">{formatRupiah(ahs.totalLabor)}</td>
                                      </tr>
                                    </>
                                  )}
                                  
                                  {/* B. BAHAN MATERIAL */}
                                  {ahs.materials.length > 0 && (
                                    <>
                                      <tr className="bg-orange-50 border-b border-orange-100">
                                        <td colSpan={6} className="px-3 py-1.5 text-[10px] font-black text-orange-700 uppercase tracking-widest">
                                          <Building className="h-3 w-3 inline-block mr-1.5" />B. Bahan Material
                                        </td>
                                      </tr>
                                      {ahs.materials.map((mat: any, mIdx: number) => (
                                        <tr key={mIdx} className="border-b border-slate-100 hover:bg-orange-50/30">
                                          <td className="px-3 py-2 font-mono text-[10px] text-slate-500 font-bold">{mat.code}</td>
                                          <td className="px-3 py-2 font-semibold text-slate-800">{mat.name}</td>
                                          <td className="px-3 py-2 text-center text-slate-500">{mat.unit}</td>
                                          
                                          {/* Material Coefficient (Inline editable) */}
                                          <td className="px-3 py-2 text-right align-middle">
                                             {editingAhsComp?.ahsCode === ahs.code && editingAhsComp?.type === 'material' && editingAhsComp?.code === mat.code ? (
                                               <input
                                                 type="number"
                                                 step="0.0001"
                                                 value={editingAhsCompValue}
                                                 onChange={(e) => setEditingAhsCompValue(e.target.value)}
                                                 onBlur={() => {
                                                   handleAhsCoefficientChange(ahs.code, 'material', mat.code, parseFloat(editingAhsCompValue) || 0);
                                                   setEditingAhsComp(null);
                                                 }}
                                                 onKeyDown={(e) => {
                                                   if (e.key === 'Enter') {
                                                     handleAhsCoefficientChange(ahs.code, 'material', mat.code, parseFloat(editingAhsCompValue) || 0);
                                                     setEditingAhsComp(null);
                                                   } else if (e.key === 'Escape') {
                                                     setEditingAhsComp(null);
                                                   }
                                                 }}
                                                 className="w-16 text-right bg-amber-50 dark:bg-slate-800 border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                                                 autoFocus
                                               />
                                             ) : (
                                               <div
                                                 onClick={() => {
                                                   setEditingAhsComp({ ahsCode: ahs.code, type: 'material', code: mat.code });
                                                   setEditingAhsCompValue(String(mat.coefficient));
                                                 }}
                                                 className="font-bold text-slate-700 dark:text-slate-355 cursor-pointer border-b border-dashed border-slate-300 hover:border-amber-500 pb-0.5 inline-block text-right"
                                                 title="Klik untuk ubah Koefisien"
                                               >
                                                 {mat.coefficient.toFixed(4)}
                                               </div>
                                             )}
                                          </td>
                                          
                                          <td className="px-3 py-2 text-right text-slate-600">{formatRupiah(mat.rate)}</td>
                                          <td className="px-3 py-2 text-right font-bold text-slate-900">{formatRupiah(mat.cost)}</td>
                                        </tr>
                                      ))}
                                      <tr className="bg-orange-50/80 border-b border-orange-200">
                                        <td colSpan={5} className="px-3 py-1.5 text-right text-[10px] font-black text-orange-700">Subtotal Bahan Material (B)</td>
                                        <td className="px-3 py-1.5 text-right font-black text-orange-800">{formatRupiah(ahs.totalMaterial)}</td>
                                      </tr>
                                    </>
                                  )}
                                  
                                  {/* C. PERALATAN */}
                                  {ahs.equipment.length > 0 && (
                                    <>
                                      <tr className="bg-teal-50 border-b border-teal-100">
                                        <td colSpan={6} className="px-3 py-1.5 text-[10px] font-black text-teal-700 uppercase tracking-widest">
                                          <Layers className="h-3 w-3 inline-block mr-1.5" />C. Peralatan
                                        </td>
                                      </tr>
                                      {ahs.equipment.map((eq: any, eIdx: number) => (
                                        <tr key={eIdx} className="border-b border-slate-100 hover:bg-teal-50/30">
                                          <td className="px-3 py-2 font-mono text-[10px] text-slate-500 font-bold">{eq.code}</td>
                                          <td className="px-3 py-2 font-semibold text-slate-800">{eq.name}</td>
                                          <td className="px-3 py-2 text-center text-slate-500">{eq.unit}</td>
                                          
                                          {/* Equipment Coefficient (Inline editable) */}
                                          <td className="px-3 py-2 text-right align-middle">
                                             {editingAhsComp?.ahsCode === ahs.code && editingAhsComp?.type === 'equipment' && editingAhsComp?.code === eq.code ? (
                                               <input
                                                 type="number"
                                                 step="0.0001"
                                                 value={editingAhsCompValue}
                                                 onChange={(e) => setEditingAhsCompValue(e.target.value)}
                                                 onBlur={() => {
                                                   handleAhsCoefficientChange(ahs.code, 'equipment', eq.code, parseFloat(editingAhsCompValue) || 0);
                                                   setEditingAhsComp(null);
                                                 }}
                                                 onKeyDown={(e) => {
                                                   if (e.key === 'Enter') {
                                                     handleAhsCoefficientChange(ahs.code, 'equipment', eq.code, parseFloat(editingAhsCompValue) || 0);
                                                     setEditingAhsComp(null);
                                                   } else if (e.key === 'Escape') {
                                                     setEditingAhsComp(null);
                                                   }
                                                 }}
                                                 className="w-16 text-right bg-amber-50 dark:bg-slate-800 border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                                                 autoFocus
                                               />
                                             ) : (
                                               <div
                                                 onClick={() => {
                                                   setEditingAhsComp({ ahsCode: ahs.code, type: 'equipment', code: eq.code });
                                                   setEditingAhsCompValue(String(eq.coefficient));
                                                 }}
                                                 className="font-bold text-slate-700 dark:text-slate-355 cursor-pointer border-b border-dashed border-slate-300 hover:border-amber-500 pb-0.5 inline-block text-right"
                                                 title="Klik untuk ubah Koefisien"
                                               >
                                                 {eq.coefficient.toFixed(4)}
                                               </div>
                                             )}
                                          </td>
                                          
                                          <td className="px-3 py-2 text-right text-slate-600">{formatRupiah(eq.rate)}</td>
                                          <td className="px-3 py-2 text-right font-bold text-slate-900">{formatRupiah(eq.cost)}</td>
                                        </tr>
                                      ))}
                                      <tr className="bg-teal-50/80 border-b border-teal-200">
                                        <td colSpan={5} className="px-3 py-1.5 text-right text-[10px] font-black text-teal-700">Subtotal Peralatan (C)</td>
                                        <td className="px-3 py-1.5 text-right font-black text-teal-850">{formatRupiah(ahs.totalEquipment)}</td>
                                      </tr>
                                    </>
                                  )}
                                  
                                  {/* TOTALS */}
                                  <tr className="bg-slate-50 border-t border-slate-300">
                                    <td colSpan={5} className="px-3 py-2 text-right text-[10px] font-bold text-slate-600">Jumlah Biaya Langsung (A+B+C)</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-850">{formatRupiah(ahs.directCost)}</td>
                                  </tr>
                                  <tr className="bg-slate-50 border-b border-slate-200">
                                    <td colSpan={5} className="px-3 py-1.5 text-right text-[10px] font-medium text-slate-500 align-middle">
                                      {editingAhsOverheadCode === ahs.code ? (
                                        <div className="inline-flex items-center gap-1.5 justify-end">
                                          <span>Overhead &amp; Keuntungan (%):</span>
                                          <input
                                            type="number"
                                            value={editingAhsOverheadValue}
                                            onChange={(e) => setEditingAhsOverheadValue(e.target.value)}
                                            onBlur={() => {
                                              handleAhsOverheadChange(ahs.code, parseFloat(editingAhsOverheadValue) || 0);
                                              setEditingAhsOverheadCode(null);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                handleAhsOverheadChange(ahs.code, parseFloat(editingAhsOverheadValue) || 0);
                                                setEditingAhsOverheadCode(null);
                                              } else if (e.key === 'Escape') {
                                                setEditingAhsOverheadCode(null);
                                              }
                                            }}
                                            className="w-12 text-right bg-amber-50 dark:bg-slate-800 border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                                            autoFocus
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          onClick={() => {
                                            setEditingAhsOverheadCode(ahs.code);
                                            setEditingAhsOverheadValue(String(ahs.overheadPercent));
                                          }}
                                          className="cursor-pointer border-b border-dashed border-slate-350 hover:border-amber-500 pb-0.5 inline-block font-semibold text-slate-600 dark:text-slate-350"
                                          title="Klik untuk ubah persentase Overhead"
                                        >
                                          Overhead &amp; Keuntungan ({ahs.overheadPercent}%)
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-medium text-slate-600">{formatRupiah(ahs.overheadCost)}</td>
                                  </tr>
                                  <tr className="bg-amber-50 border-b border-amber-300">
                                    <td colSpan={5} className="px-3 py-3 text-right text-xs font-black text-slate-800 uppercase tracking-wide">Harga Satuan Pekerjaan / {ahs.unit}</td>
                                    <td className="px-3 py-3 text-right text-sm font-black" style={{ color: 'var(--accent-primary)' }}>{formatRupiah(ahs.unitPrice)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
