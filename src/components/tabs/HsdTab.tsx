import React from 'react';
import { Search, Plus, Users, Building } from 'lucide-react';
import type { RabData } from '../../utils/rabParser';

interface HsdTabProps {
  data: RabData;
  formatRupiah: (val: number) => string;
  hsdActiveSubTab: 'labor' | 'materials';
  setHsdActiveSubTab: (tab: 'labor' | 'materials') => void;
  hsdSearch: string;
  setHsdSearch: (search: string) => void;

  editingHsdCode: string | null;
  setEditingHsdCode: (code: string | null) => void;
  editingHsdValue: string;
  setEditingHsdValue: (val: string) => void;

  handleHsdPriceChange: (type: 'labor' | 'material', code: string, newRate: number) => void;
  setShowAddHsdModal: (show: boolean) => void;
}

export const HsdTab: React.FC<HsdTabProps> = ({
  data,
  formatRupiah,
  hsdActiveSubTab,
  setHsdActiveSubTab,
  hsdSearch,
  setHsdSearch,
  editingHsdCode,
  setEditingHsdCode,
  editingHsdValue,
  setEditingHsdValue,
  handleHsdPriceChange,
  setShowAddHsdModal
}) => {
  // Filter HSD arrays
  const laborList = data.labor.filter(item => 
    item.name.toLowerCase().includes(hsdSearch.toLowerCase()) || 
    item.code.toLowerCase().includes(hsdSearch.toLowerCase())
  );
  
  const materialList = data.materials.filter(item => 
    item.name.toLowerCase().includes(hsdSearch.toLowerCase()) || 
    item.code.toLowerCase().includes(hsdSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 tab-slide-fade">
      <div className="saas-card p-6 bg-white border border-slate-200">
        
        {/* Navigation Tabs for HSD Category */}
        <div className="border-b border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
          <div className="flex -mb-[1px]">
            <button 
              onClick={() => setHsdActiveSubTab('labor')}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-[2.5px] cursor-pointer flex items-center gap-1.5 transition-colors ${
                hsdActiveSubTab === 'labor' 
                  ? 'border-amber-500 text-slate-800 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
              type="button"
            >
              <Users className="h-3.5 w-3.5" />
              Upah Tenaga Kerja
            </button>
            <button 
              onClick={() => setHsdActiveSubTab('materials')}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-[2.5px] cursor-pointer flex items-center gap-1.5 transition-colors ${
                hsdActiveSubTab === 'materials' 
                  ? 'border-amber-500 text-slate-800 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
              type="button"
            >
              <Building className="h-3.5 w-3.5" />
              Bahan Bangunan / Material
            </button>
          </div>

          {/* Search HSD + Add HSD */}
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <div className="relative">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Sumber Daya..." 
                value={hsdSearch}
                onChange={(e) => setHsdSearch(e.target.value)}
                className="saas-input pl-search py-1 text-xs w-48"
              />
            </div>
            <button 
              onClick={() => setShowAddHsdModal(true)}
              className="saas-button cursor-pointer py-1 px-3 text-[10px] flex items-center gap-1"
              type="button"
            >
              <Plus className="h-3.5 w-3.5 text-slate-950" /> Tambah HSD
            </button>
          </div>
        </div>

        {/* DATA TABLES */}
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          {hsdActiveSubTab === 'labor' ? (
            <table className="spreadsheet-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Kode</th>
                  <th>Deskripsi Tenaga Kerja</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Satuan</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Harga Satuan Dasar (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {laborList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                      Tidak ditemukan data upah kerja.
                    </td>
                  </tr>
                ) : (
                  laborList.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center' }} className="font-mono font-bold text-slate-600">{item.code}</td>
                      <td className="font-bold text-slate-800">{item.name}</td>
                      <td style={{ textAlign: 'center' }} className="font-semibold text-slate-500">{item.unit}</td>
                      
                      {/* Price inline edit */}
                      <td style={{ textAlign: 'right' }} className="align-middle">
                        {editingHsdCode === item.code ? (
                          <input
                            type="number"
                            value={editingHsdValue}
                            onChange={(e) => setEditingHsdValue(e.target.value)}
                            onBlur={() => {
                              handleHsdPriceChange('labor', item.code, parseFloat(editingHsdValue) || 0);
                              setEditingHsdCode(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleHsdPriceChange('labor', item.code, parseFloat(editingHsdValue) || 0);
                                setEditingHsdCode(null);
                              } else if (e.key === 'Escape') {
                                setEditingHsdCode(null);
                              }
                            }}
                            className="w-32 text-right bg-amber-50 dark:bg-slate-800 border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => {
                              setEditingHsdCode(item.code);
                              setEditingHsdValue(String(item.rate));
                            }}
                            className="font-bold text-slate-700 dark:text-slate-355 cursor-pointer border-b border-dashed border-slate-300 hover:border-amber-500 pb-0.5 inline-block text-right"
                            title="Klik untuk ubah Harga Dasar"
                          >
                            {formatRupiah(item.rate)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="spreadsheet-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Kode</th>
                  <th>Deskripsi Bahan / Material</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Satuan</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Harga Satuan Dasar (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {materialList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                      Tidak ditemukan data bahan material.
                    </td>
                  </tr>
                ) : (
                  materialList.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center' }} className="font-mono font-bold text-slate-600">{item.code}</td>
                      <td className="font-bold text-slate-800">{item.name}</td>
                      <td style={{ textAlign: 'center' }} className="font-semibold text-slate-500">{item.unit}</td>
                      
                      {/* Price inline edit */}
                      <td style={{ textAlign: 'right' }} className="align-middle">
                        {editingHsdCode === item.code ? (
                          <input
                            type="number"
                            value={editingHsdValue}
                            onChange={(e) => setEditingHsdValue(e.target.value)}
                            onBlur={() => {
                              handleHsdPriceChange('material', item.code, parseFloat(editingHsdValue) || 0);
                              setEditingHsdCode(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleHsdPriceChange('material', item.code, parseFloat(editingHsdValue) || 0);
                                setEditingHsdCode(null);
                              } else if (e.key === 'Escape') {
                                setEditingHsdCode(null);
                              }
                            }}
                            className="w-32 text-right bg-amber-50 dark:bg-slate-800 border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => {
                              setEditingHsdCode(item.code);
                              setEditingHsdValue(String(item.rate));
                            }}
                            className="font-bold text-slate-700 dark:text-slate-355 cursor-pointer border-b border-dashed border-slate-300 hover:border-amber-500 pb-0.5 inline-block text-right"
                            title="Klik untuk ubah Harga Dasar"
                          >
                            {formatRupiah(item.rate)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
