import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { recalculateRab } from '../../../utils/rabParser';
import type { RabData } from '../../../utils/rabParser';

interface AddBoqItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RabData;
  onDataUpdate: (newData: RabData) => void;
  initialDivision?: string;
}

export const AddBoqItemModal: React.FC<AddBoqItemModalProps> = ({
  isOpen,
  onClose,
  data,
  onDataUpdate,
  initialDivision = ''
}) => {
  const [selectedDivForBoq, setSelectedDivForBoq] = useState<string>(initialDivision);
  const [newBoqNo, setNewBoqNo] = useState<string>('');
  const [newBoqName, setNewBoqName] = useState<string>('');
  const [newBoqUnit, setNewBoqUnit] = useState<string>('m2');
  const [newBoqVolume, setNewBoqVolume] = useState<number>(0);
  const [newBoqAhsCode, setNewBoqAhsCode] = useState<string>('');
  const [newBoqManualPrice, setNewBoqManualPrice] = useState<number>(0);
  const [isAhsLinked, setIsAhsLinked] = useState<boolean>(true);

  // Synchronize division and AHS defaults
  useEffect(() => {
    if (initialDivision) {
      setSelectedDivForBoq(initialDivision);
    } else if (data.rekap.length > 0) {
      setSelectedDivForBoq(data.rekap[0].description);
    }
  }, [initialDivision, data.rekap, isOpen]);

  useEffect(() => {
    if (data.ahsp.length > 0 && !newBoqAhsCode) {
      setNewBoqAhsCode(data.ahsp[0].code);
    }
  }, [data.ahsp, newBoqAhsCode, isOpen]);

  if (!isOpen) return null;

  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoqNo || !newBoqName || !selectedDivForBoq || newBoqVolume <= 0) return;

    let unitPrice = 0;
    let ahsCode = '';
    if (isAhsLinked) {
      const ahs = data.ahsp.find(a => a.code === newBoqAhsCode);
      if (!ahs) {
        alert('Analisa AHSP terpilih tidak ditemukan!');
        return;
      }
      unitPrice = ahs.unitPrice;
      ahsCode = ahs.code;
    } else {
      unitPrice = newBoqManualPrice;
    }

    const totalPrice = newBoqVolume * unitPrice;

    const newItem = {
      no: newBoqNo,
      description: newBoqName,
      unit: newBoqUnit,
      volume: newBoqVolume,
      unitPrice,
      totalPrice,
      isHeader: false,
      ahsCode: ahsCode || undefined
    };

    const divIndex = data.boq.findIndex(b => b.isHeader && b.description === selectedDivForBoq);
    if (divIndex === -1) {
      alert('Divisi target tidak ditemukan!');
      return;
    }

    let insertIndex = divIndex + 1;
    while (insertIndex < data.boq.length && !data.boq[insertIndex].isHeader) {
      insertIndex++;
    }

    const updatedBoq = [...data.boq];
    updatedBoq.splice(insertIndex, 0, newItem);

    onDataUpdate(recalculateRab({
      ...data,
      boq: updatedBoq
    }));

    setNewBoqNo('');
    setNewBoqName('');
    setNewBoqVolume(0);
    setNewBoqManualPrice(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="saas-modal p-6 max-w-md w-full space-y-4">
        <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <Plus className="h-5 w-5 text-amber-500" /> Tambah Item Pekerjaan (BoQ)
        </h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Pilih Divisi Kelompok</label>
            <select 
              value={selectedDivForBoq} 
              onChange={(e) => setSelectedDivForBoq(e.target.value)} 
              className="saas-input font-bold"
            >
              {data.rekap.map(r => (
                <option key={r.description} value={r.description}>
                  {r.no}. {r.description}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">No. Pekerjaan</label>
              <input 
                type="text" 
                required 
                value={newBoqNo} 
                onChange={(e) => setNewBoqNo(e.target.value)} 
                className="saas-input font-bold" 
                placeholder="3.1" 
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Deskripsi Uraian Pekerjaan</label>
              <input 
                type="text" 
                required 
                value={newBoqName} 
                onChange={(e) => setNewBoqName(e.target.value)} 
                className="saas-input" 
                placeholder="Pasang Keramik Lantai 40x40" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Satuan</label>
              <input 
                type="text" 
                required 
                value={newBoqUnit} 
                onChange={(e) => setNewBoqUnit(e.target.value)} 
                className="saas-input" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Volume Pekerjaan</label>
              <input 
                type="number" 
                required 
                value={newBoqVolume || ''} 
                onChange={(e) => setNewBoqVolume(parseFloat(e.target.value) || 0)} 
                className="saas-input text-right font-bold text-slate-900" 
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isAhsLinked} 
                onChange={(e) => setIsAhsLinked(e.target.checked)} 
                className="w-4 h-4 cursor-pointer" 
              />
              <span className="text-[10.5px] font-extrabold text-slate-650 uppercase">Hubungkan Ke Formula AHS</span>
            </div>
            {isAhsLinked ? (
              <div className="space-y-1 pt-1">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase">Pilih Analisa AHSP Aktif</label>
                <select 
                  value={newBoqAhsCode} 
                  onChange={(e) => setNewBoqAhsCode(e.target.value)} 
                  className="saas-input font-bold py-1 text-xs"
                >
                  {data.ahsp.map(a => (
                    <option key={a.code} value={a.code}>
                      {a.code} - {a.name} ({formatRupiah(a.unitPrice)}/{a.unit})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1 pt-1">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase">Harga Satuan Manual (Rp)</label>
                <input 
                  type="number" 
                  value={newBoqManualPrice || ''} 
                  onChange={(e) => setNewBoqManualPrice(parseFloat(e.target.value) || 0)} 
                  className="saas-input text-right py-1 text-xs" 
                />
              </div>
            )}
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
              Simpan Pekerjaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
