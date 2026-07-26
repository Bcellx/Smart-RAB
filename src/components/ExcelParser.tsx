import React, { useState, useEffect, useRef } from 'react';
import { read } from 'xlsx';
import { FileUp, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import { parseWorkbook } from '../utils/rabParser';
import type { RabData } from '../utils/rabParser';

interface ExcelParserProps {
  onDataParsed: (data: RabData) => void;
  onLoadingStateChange: (isLoading: boolean) => void;
}

export const ExcelParser: React.FC<ExcelParserProps> = ({ onDataParsed, onLoadingStateChange }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Do not load default excel automatically on mount, let the workspace start empty
  useEffect(() => {
    // loadDefaultExcel(); // Disabled auto-load to keep the project clean
  }, []);

  const loadDefaultExcel = async () => {
    setStatus('loading');
    onLoadingStateChange(true);
    try {
      setFileName('HPS TOILED.xlsx (File Contoh/Demo)');
      const response = await fetch('/HPS TOILED.xlsx');
      if (!response.ok) {
        throw new Error('Default Excel file not found in public/');
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' });
      const parsedData = parseWorkbook(workbook);
      
      setStatus('success');
      onDataParsed(parsedData);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      onLoadingStateChange(false);
    }
  };

  const processFile = async (file: File) => {
    setStatus('loading');
    onLoadingStateChange(true);
    setFileName(file.name);
    
    // Support JSON backup file restoration
    if (file.name.endsWith('.json')) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const parsed = JSON.parse(text);
            
            if (!parsed.projectName || !parsed.boq || !parsed.ahsp) {
              throw new Error('Berkas JSON tidak sesuai format Smart RAB');
            }
            
            setStatus('success');
            onDataParsed(parsed);
          } catch (innerErr) {
            console.error(innerErr);
            alert('Gagal memuat: Format berkas cadangan JSON tidak valid!');
            setStatus('error');
          } finally {
            onLoadingStateChange(false);
          }
        };
        reader.readAsText(file);
      } catch (err) {
        console.error(err);
        setStatus('error');
        onLoadingStateChange(false);
      }
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error('No data read from file');
          
          const workbook = read(data, { type: 'binary' });
          const parsedData = parseWorkbook(workbook);
          
          setStatus('success');
          onDataParsed(parsedData);
        } catch (innerErr) {
          console.error(innerErr);
          setStatus('error');
        } finally {
          onLoadingStateChange(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      setStatus('error');
      onLoadingStateChange(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 w-full animate-fade-in no-print">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer min-h-[180px] ${
          dragActive 
            ? 'border-amber-500 bg-amber-50' 
            : 'border-slate-200 hover:border-amber-500 hover:bg-slate-50/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          className="hidden" 
          accept=".xlsx, .xls, .json"
          onChange={handleChange}
        />
        
        {status === 'loading' ? (
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            <h4 className="font-bold text-slate-800 text-sm">Memproses File Proyek...</h4>
            <p className="text-slate-500 text-[10px]">Membaca data rekapitulasi, upah, bahan, dan analisa AHSP...</p>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <h4 className="font-bold text-slate-800 text-sm">Berkas Berhasil Dimuat!</h4>
            <p className="text-slate-700 font-extrabold text-[10px] bg-slate-100 border border-slate-200 px-3 py-1.5 rounded truncate max-w-[240px]">{fileName}</p>
            <p className="text-slate-400 text-[9px]">Klik atau seret file lain untuk mengganti berkas kerja</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <FileUp className="h-8 w-8 text-amber-500" />
            <h4 className="font-bold text-slate-800 text-sm">Unggah Excel / Cadangan JSON</h4>
            <p className="text-slate-500 text-[10px] leading-relaxed max-w-[240px] mx-auto">
              Seret berkas HPS/RAB Anda (.xlsx) atau file backup (.json) ke sini, atau klik untuk memilih
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button 
          onClick={loadDefaultExcel}
          className="w-full saas-button cursor-pointer py-2.5 px-3 flex items-center justify-center gap-2"
          type="button"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Muat File Contoh (Demo)
        </button>
        <div className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
          <Layers className="h-3.5 w-3.5 text-amber-500" /> Format Output: Rekap, BoQ, AHSP, &amp; SMKK PUPR
        </div>
      </div>
    </div>
  );
};
export default ExcelParser;
