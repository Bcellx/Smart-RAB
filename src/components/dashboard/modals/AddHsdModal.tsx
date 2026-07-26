import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { RabData } from '../../../utils/rabParser';

interface AddHsdModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RabData;
  onDataUpdate: (newData: RabData) => void;
}

export const AddHsdModal: React.FC<AddHsdModalProps> = ({
  isOpen,
  onClose,
  data,
  onDataUpdate,
}) => {
  const [newHsdType, setNewHsdType] = useState<'labor' | 'material'>('labor');
  const [newHsdCode, setNewHsdCode] = useState<string>('');
  const [newHsdName, setNewHsdName] = useState<string>('');
  const [newHsdUnit, setNewHsdUnit] = useState<string>('OH');
  const [newHsdRate, setNewHsdRate] = useState<number>(0);
  const [newHsdRapRate, setNewHsdRapRate] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHsdCode || !newHsdName || newHsdRate <= 0) return;

    const newItem = {
      code: newHsdCode,
      name: newHsdName,
      unit: newHsdUnit,
      rate: newHsdRate
    };

    if (newHsdType === 'labor') {
      const exists = data.labor.some(l => l.code === newHsdCode);
      if (exists) {
        alert('Tenaga kerja dengan kode ini sudah ada!');
        return;
      }
      const updatedLabor = [...data.labor, newItem];
      onDataUpdate({
        ...data,
        labor: updatedLabor,
        rapLabor: data.rapLabor ? [...data.rapLabor, { ...newItem, rate: newHsdRapRate || newHsdRate }] : undefined
      });
    } else {
      const exists = data.materials.some(m => m.code === newHsdCode);
      if (exists) {
        alert('Material dengan kode ini sudah ada!');
        return;
      }
      const updatedMaterials = [...data.materials, newItem];
      onDataUpdate({
        ...data,
        materials: updatedMaterials,
        rapMaterials: data.rapMaterials ? [...data.rapMaterials, { ...newItem, rate: newHsdRapRate || newHsdRate }] : undefined
      });
    }

    setNewHsdCode('');
    setNewHsdName('');
    setNewHsdRate(0);
    setNewHsdRapRate(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="saas-modal p-6 max-w-sm w-full space-y-4">
        <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <Plus className="h-5 w-5 text-amber-500" /> Tambah Sumber Daya (HSD)
        </h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Tipe Sumber Daya</label>
            <select 
              value={newHsdType} 
              onChange={(e) => {
                setNewHsdType(e.target.value as 'labor' | 'material');
                setNewHsdUnit(e.target.value === 'labor' ? 'OH' : 'kg');
              }}
              className="saas-input"
            >
              <option value="labor">Upah Tenaga Kerja</option>
              <option value="material">Bahan Bangunan / Material</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Kode</label>
            <input 
              type="text" 
              required 
              value={newHsdCode} 
              onChange={(e) => setNewHsdCode(e.target.value)} 
              className="saas-input font-mono" 
              placeholder="Contoh: L.05 atau M.55" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Deskripsi</label>
            <input 
              type="text" 
              required 
              value={newHsdName} 
              onChange={(e) => setNewHsdName(e.target.value)} 
              className="saas-input" 
              placeholder="Contoh: Tukang Besi" 
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Satuan</label>
              <input 
                type="text" 
                required 
                value={newHsdUnit} 
                onChange={(e) => setNewHsdUnit(e.target.value)} 
                className="saas-input" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Harga RAB</label>
              <input 
                type="number" 
                required 
                value={newHsdRate || ''} 
                onChange={(e) => setNewHsdRate(parseFloat(e.target.value) || 0)} 
                className="saas-input text-right" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Harga RAP Lapangan</label>
            <input 
              type="number" 
              value={newHsdRapRate || ''} 
              onChange={(e) => setNewHsdRapRate(parseFloat(e.target.value) || 0)} 
              className="saas-input text-right" 
              placeholder="Opsional (Kosongkan = sama)" 
            />
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
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
