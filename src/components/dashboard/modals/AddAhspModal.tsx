import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { RabData } from '../../../utils/rabParser';

interface AddAhspModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RabData;
  onDataUpdate: (newData: RabData) => void;
}

interface ComponentItem {
  type: 'labor' | 'material';
  code: string;
  name: string;
  unit: string;
  rate: number;
  coefficient: number;
}

export const AddAhspModal: React.FC<AddAhspModalProps> = ({
  isOpen,
  onClose,
  data,
  onDataUpdate,
}) => {
  const [newAhsCode, setNewAhsCode] = useState<string>('');
  const [newAhsName, setNewAhsName] = useState<string>('');
  const [newAhsUnit, setNewAhsUnit] = useState<string>('m2');
  const [newAhsOverhead, setNewAhsOverhead] = useState<number>(10);
  const [newAhsComponents, setNewAhsComponents] = useState<ComponentItem[]>([]);
  
  const [selectedCompType, setSelectedCompType] = useState<'labor' | 'material'>('labor');
  const [selectedCompCode, setSelectedCompCode] = useState<string>('');
  const [selectedCompCoeff, setSelectedCompCoeff] = useState<number>(0);

  if (!isOpen) return null;

  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleAddComponent = () => {
    if (!selectedCompCode || selectedCompCoeff <= 0) return;
    
    if (newAhsComponents.some(c => c.code === selectedCompCode)) {
      alert('Komponen HSD sudah ada dalam formula ini!');
      return;
    }

    const hsd = selectedCompType === 'labor' 
      ? data.labor.find(l => l.code === selectedCompCode)
      : data.materials.find(m => m.code === selectedCompCode);

    if (!hsd) return;

    setNewAhsComponents([
      ...newAhsComponents,
      {
        type: selectedCompType,
        code: hsd.code,
        name: hsd.name,
        unit: hsd.unit,
        rate: hsd.rate,
        coefficient: selectedCompCoeff
      }
    ]);

    setSelectedCompCode('');
    setSelectedCompCoeff(0);
  };

  const handleRemoveComponent = (code: string) => {
    setNewAhsComponents(newAhsComponents.filter(c => c.code !== code));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAhsCode || !newAhsName || !newAhsUnit) return;

    const exists = data.ahsp.some(a => a.code === newAhsCode);
    if (exists) {
      alert('Analisa dengan kode ini sudah ada!');
      return;
    }

    const labor = newAhsComponents.filter(c => c.type === 'labor').map(c => ({
      type: 'labor' as const,
      code: c.code,
      name: c.name,
      unit: c.unit,
      rate: c.rate,
      coefficient: c.coefficient,
      cost: c.rate * c.coefficient
    }));

    const materials = newAhsComponents.filter(c => c.type === 'material').map(c => ({
      type: 'material' as const,
      code: c.code,
      name: c.name,
      unit: c.unit,
      rate: c.rate,
      coefficient: c.coefficient,
      cost: c.rate * c.coefficient
    }));

    const laborCost = labor.reduce((acc, l) => acc + l.rate * l.coefficient, 0);
    const materialCost = materials.reduce((acc, m) => acc + m.rate * m.coefficient, 0);
    const directCost = laborCost + materialCost;
    const overheadCost = directCost * (newAhsOverhead / 100);
    const unitPrice = directCost + overheadCost;

    const newAhs = {
      code: newAhsCode,
      name: newAhsName,
      unit: newAhsUnit,
      overheadPercent: newAhsOverhead,
      labor,
      materials,
      equipment: [],
      totalLabor: laborCost,
      totalMaterial: materialCost,
      totalEquipment: 0,
      directCost,
      overheadCost,
      unitPrice
    };

    onDataUpdate({
      ...data,
      ahsp: [...data.ahsp, newAhs]
    });

    setNewAhsCode('');
    setNewAhsName('');
    setNewAhsUnit('m2');
    setNewAhsOverhead(10);
    setNewAhsComponents([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="saas-modal p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
        <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <Plus className="h-5 w-5 text-amber-500" /> Tambah Formula Analisa (AHSP)
        </h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Kode Analisa</label>
              <input 
                type="text" 
                required 
                value={newAhsCode} 
                onChange={(e) => setNewAhsCode(e.target.value)} 
                className="saas-input font-mono" 
                placeholder="A.2.2.1" 
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Nama Analisa</label>
              <input 
                type="text" 
                required 
                value={newAhsName} 
                onChange={(e) => setNewAhsName(e.target.value)} 
                className="saas-input" 
                placeholder="Pasangan Bata Merah" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Satuan Volume</label>
              <input 
                type="text" 
                required 
                value={newAhsUnit} 
                onChange={(e) => setNewAhsUnit(e.target.value)} 
                className="saas-input" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Overhead (%)</label>
              <input 
                type="number" 
                required 
                value={newAhsOverhead || ''} 
                onChange={(e) => setNewAhsOverhead(parseFloat(e.target.value) || 0)} 
                className="saas-input" 
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
            <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Tambahkan Komponen HSD</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <select 
                value={selectedCompType} 
                onChange={(e) => { setSelectedCompType(e.target.value as 'labor' | 'material'); setSelectedCompCode(''); }} 
                className="saas-input py-1 text-xs"
              >
                <option value="labor">Upah</option>
                <option value="material">Bahan</option>
              </select>
              <select 
                value={selectedCompCode} 
                onChange={(e) => setSelectedCompCode(e.target.value)} 
                className="saas-input py-1 text-xs md:col-span-2"
              >
                <option value="">-- Pilih HSD --</option>
                {(selectedCompType === 'labor' ? data.labor : data.materials).map(item => (
                  <option key={item.code} value={item.code}>{item.code} - {item.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  step="0.0001" 
                  value={selectedCompCoeff || ''} 
                  onChange={(e) => setSelectedCompCoeff(parseFloat(e.target.value) || 0)} 
                  className="saas-input text-right py-1 text-xs w-full" 
                  placeholder="Koef." 
                />
                <button 
                  type="button" 
                  onClick={handleAddComponent} 
                  className="saas-button py-1 px-3 text-xs uppercase cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden max-h-32 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 font-bold text-[9px] uppercase tracking-wide text-slate-450">
                  <th className="px-2.5 py-1.5">Kode</th>
                  <th className="px-2.5 py-1.5">Komponen</th>
                  <th className="px-2.5 py-1.5 text-right">Koef</th>
                  <th className="px-2.5 py-1.5 text-right">Harga</th>
                  <th className="px-2.5 py-1.5 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {newAhsComponents.map(c => (
                  <tr key={c.code} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-2.5 py-1 font-mono text-[10px] text-slate-500">{c.code}</td>
                    <td className="px-2.5 py-1 font-bold text-slate-750">{c.name}</td>
                    <td className="px-2.5 py-1 text-right font-semibold">{c.coefficient}</td>
                    <td className="px-2.5 py-1 text-right text-slate-500">{formatRupiah(c.rate)}</td>
                    <td className="px-2.5 py-1 text-center">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveComponent(c.code)} 
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 pt-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="saas-button-secondary w-full py-2 text-xs font-bold uppercase cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="saas-button w-full py-2 text-xs font-bold uppercase cursor-pointer"
            >
              Simpan Analisa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
