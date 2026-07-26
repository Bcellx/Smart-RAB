import React from 'react';
import { Layers, Users, Building } from 'lucide-react';

interface BomRow {
  code: string;
  name: string;
  unit: string;
  quantity: number;
  rate: number;
  cost: number;
  type: 'labor' | 'material' | 'equipment';
}

interface BomTabProps {
  bomLabor: BomRow[];
  bomMaterials: BomRow[];
}

export const BomTab: React.FC<BomTabProps> = ({ bomLabor, bomMaterials }) => {
  return (
    <div className="space-y-4 tab-slide-fade">
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-amber-500" /> Rekap Kebutuhan Riil Bahan & Tenaga Kerja (Bill of Materials)
          </h3>
          <p className="text-[11px] text-slate-500 leading-normal mt-1">
            Halaman ini merangkum total volume material dasar, jumlah hari-orang (man-days) pekerja, serta peralatan yang dibutuhkan untuk menyelesaikan seluruh volume pekerjaan konstruksi sesuai RAB.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Labor BOM List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide border-b border-slate-100 pb-1.5 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Tenaga Kerja (Man-Days)
            </h4>
            <div className="bom-list-container space-y-1">
              {bomLabor.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">Tidak ada data</div>
              ) : (
                bomLabor.map((row, rIdx) => (
                  <div key={rIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                    <span className="font-extrabold text-slate-700 text-xs">{row.name}</span>
                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 shrink-0">
                      {row.quantity.toLocaleString('id-ID', { maximumFractionDigits: 1 })} OH
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Materials BOM List */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wide border-b border-slate-100 pb-1.5 flex items-center gap-1">
              <Building className="h-3.5 w-3.5" /> Bahan Konstruksi (Volume Riil)
            </h4>
            <div className="bom-list-container grid grid-cols-1 md:grid-cols-2 gap-3">
              {bomMaterials.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium col-span-2">Tidak ada data</div>
              ) : (
                bomMaterials.map((row, rIdx) => (
                  <div key={rIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-orange-200 transition-colors">
                    <span className="font-extrabold text-slate-700 text-xs truncate mr-2" title={row.name}>{row.name}</span>
                    <span className="text-xs font-black text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-xl shrink-0">
                      {row.quantity.toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-400 font-bold ml-0.5">{row.unit}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
