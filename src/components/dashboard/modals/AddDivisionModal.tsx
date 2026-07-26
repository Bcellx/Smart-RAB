import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { RabData } from '../../../utils/rabParser';

interface AddDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RabData;
  onDataUpdate: (newData: RabData) => void;
}

export const AddDivisionModal: React.FC<AddDivisionModalProps> = ({
  isOpen,
  onClose,
  data,
  onDataUpdate,
}) => {
  const [newDivNo, setNewDivNo] = useState<string>('');
  const [newDivName, setNewDivName] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivNo || !newDivName) return;

    const exists = data.rekap.some(r => r.description === newDivName);
    if (exists) {
      alert('Divisi dengan nama ini sudah ada!');
      return;
    }

    const newRekapItem = {
      no: newDivNo,
      description: newDivName,
      totalPrice: 0
    };

    const newBoqHeader = {
      no: newDivNo,
      description: newDivName,
      unit: '',
      volume: 0,
      unitPrice: 0,
      totalPrice: 0,
      isHeader: true
    };

    onDataUpdate({
      ...data,
      boq: [...data.boq, newBoqHeader],
      rekap: [...data.rekap, newRekapItem]
    });

    setNewDivNo('');
    setNewDivName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="saas-modal p-6 max-w-sm w-full space-y-4">
        <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <Plus className="h-5 w-5 text-amber-500" /> Tambah Divisi Pekerjaan baru
        </h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase">No. Divisi / Kode</label>
            <input 
              type="text" 
              required 
              value={newDivNo} 
              onChange={(e) => setNewDivNo(e.target.value)} 
              className="saas-input font-bold" 
              placeholder="Contoh: III atau 3.0" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Deskripsi Nama Divisi</label>
            <input 
              type="text" 
              required 
              value={newDivName} 
              onChange={(e) => setNewDivName(e.target.value)} 
              className="saas-input" 
              placeholder="Pekerjaan Plesteran & Pasang Ubin" 
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
              Buat Divisi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
