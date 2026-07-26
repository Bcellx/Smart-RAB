import React from 'react';
import { Building, DollarSign, Calculator, Layers, Cloud, Loader2, Printer, FileUp, AlertTriangle } from 'lucide-react';
import type { RabData } from '../../utils/rabParser';

interface ConfigTabProps {
  data: RabData;
  onDataUpdate: (newData: RabData) => void;
  vatPercent: number;
  setVatPercent: (percent: number) => void;
  totalProjectCost: number;
  vat: number;
  grandTotal: number;
  formatRupiah: (val: number) => string;
  boqViewMode: 'grid' | 'card';
  setBoqViewMode: (mode: 'grid' | 'card') => void;
  themeMode: 'light-saas' | 'opnsense';
  setThemeMode: (mode: 'light-saas' | 'opnsense') => void;
  hsdEditMode: 'rab' | 'rap';
  setHsdEditMode: (mode: 'rab' | 'rap') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  syncStatus: 'idle' | 'loading' | 'success' | 'error';
  syncMessage: string | null;
  handleSync: () => void;
  handleDownloadBackup: () => void;
  onUploadNew: () => void;
  profitMarginPercent: number;
  profitProjection: number;
  totalRap: number;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({
  data,
  onDataUpdate,
  vatPercent,
  setVatPercent,
  totalProjectCost,
  vat,
  grandTotal,
  formatRupiah,
  boqViewMode,
  setBoqViewMode,
  themeMode,
  setThemeMode,
  hsdEditMode,
  setHsdEditMode,
  sidebarCollapsed,
  setSidebarCollapsed,
  syncStatus,
  syncMessage,
  handleSync,
  handleDownloadBackup,
  onUploadNew,
  profitMarginPercent,
  profitProjection,
  totalRap
}) => {
  return (
    <div className="space-y-6 tab-slide-fade">
      {/* Auto-save notification bar */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in no-print shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-extrabold uppercase text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-md tracking-wider">Simpan Otomatis</span>
        <span>Seluruh konfigurasi dasar dan pilihan tema visual Anda <strong>langsung disimpan secara real-time</strong> begitu nilai input diubah.</span>
      </div>

      {themeMode === 'opnsense' ? (
        /* OPNsense Firewall Parameter Table Settings Overhaul */
        <div className="space-y-6">
          
          {/* Card: Project Metadata Card */}
          <div className="saas-card bg-white border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="h-4.5 w-4.5 text-orange-500" /> Informasi Proyek Dasar
              </span>
            </div>

            <table className="opnsense-form-table">
              <tbody>
                <tr>
                  <td>Nama Proyek</td>
                  <td>
                    <input 
                      type="text" 
                      value={data.projectName}
                      onChange={(e) => onDataUpdate({ ...data, projectName: e.target.value })}
                      className="saas-input w-full max-w-lg font-semibold text-sm"
                      placeholder="Contoh: Pembangunan Jembatan Beton"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Lokasi Proyek</td>
                  <td>
                    <input 
                      type="text" 
                      value={data.location}
                      onChange={(e) => onDataUpdate({ ...data, location: e.target.value })}
                      className="saas-input w-full max-w-lg font-semibold text-sm"
                      placeholder="Contoh: Kec. Wonokromo, Surabaya"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Tahun Anggaran</td>
                  <td>
                    <input 
                      type="text" 
                      value={data.year}
                      onChange={(e) => onDataUpdate({ ...data, year: e.target.value })}
                      className="saas-input w-48 font-semibold text-sm"
                      placeholder="Contoh: 2026"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card: Financial / Tax Configurations */}
          <div className="saas-card bg-white border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-4.5 w-4.5 text-orange-500" /> Konfigurasi Keuangan &amp; Pajak
              </span>
            </div>

            <table className="opnsense-form-table">
              <tbody>
                <tr>
                  <td>Persentase PPN (%)</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={vatPercent}
                        onChange={(e) => setVatPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input w-32 font-semibold text-sm"
                      />
                      <span className="text-xs text-slate-500 font-medium">
                        PPN regulasi saat ini: <strong>11%</strong> (PPN 12% direncanakan segera).
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Simulasi Pajak Proyek</td>
                  <td>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs max-w-md">
                      <div className="flex justify-between text-slate-600">
                        <span>Biaya Fisik Konstruksi (RAB):</span>
                        <span className="font-bold text-slate-800">{formatRupiah(totalProjectCost)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Pajak PPN ({vatPercent}%):</span>
                        <span className="font-bold text-slate-800">{formatRupiah(vat)}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 font-black">
                        <span>Total RAB Kontrak Klien:</span>
                        <span className="text-orange-655" style={{ color: 'var(--accent-primary)' }}>{formatRupiah(grandTotal)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card: Visual Settings & Themes */}
          <div className="saas-card bg-white border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-orange-500" /> Tampilan &amp; Personalisasi
              </span>
            </div>

            <table className="opnsense-form-table">
              <tbody>
                <tr>
                  <td>Layout Default BoQ</td>
                  <td>
                    <select 
                      value={boqViewMode}
                      onChange={(e) => setBoqViewMode(e.target.value as 'grid' | 'card')}
                      className="saas-input font-semibold text-sm w-80"
                    >
                      <option value="grid">Grid Spreadsheet (Tampilan Excel)</option>
                      <option value="card">Modul Kartu Visual (Tampilan Modern)</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Tema Warna Antarmuka</td>
                  <td>
                    <select 
                      value={themeMode}
                      onChange={(e) => setThemeMode(e.target.value as 'light-saas' | 'opnsense')}
                      className="saas-input font-semibold text-sm w-80"
                    >
                      <option value="light-saas">⚡ Modern Light SaaS (Amber Clean - Rekomendasi)</option>
                      <option value="opnsense">🌙 Modern Dark Pro (Midnight Glass)</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Target Edit Harga Dasar (HSD)</td>
                  <td>
                    <select 
                      value={hsdEditMode}
                      onChange={(e) => setHsdEditMode(e.target.value as 'rab' | 'rap')}
                      className="saas-input font-semibold text-sm w-80"
                    >
                      <option value="rab">Harga RAB Kontrak (Klien)</option>
                      <option value="rap">Harga RAP Lapangan (Riil Kontraktor)</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Sembunyikan Sidebar Menu</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={sidebarCollapsed}
                        onChange={(e) => setSidebarCollapsed(e.target.checked)}
                        className="w-4.5 h-4.5 text-orange-550 cursor-pointer"
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Sembunyikan Sidebar</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Project Metadata Card */}
            <div className="saas-card p-6 bg-white border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-amber-500" /> Informasi Proyek Dasar
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nama Proyek</label>
                  <input 
                    type="text" 
                    value={data.projectName}
                    onChange={(e) => onDataUpdate({ ...data, projectName: e.target.value })}
                    className="saas-input font-semibold text-sm"
                    placeholder="Contoh: Pembangunan Jembatan Beton"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lokasi Proyek</label>
                  <input 
                    type="text" 
                    value={data.location}
                    onChange={(e) => onDataUpdate({ ...data, location: e.target.value })}
                    className="saas-input font-semibold text-sm"
                    placeholder="Contoh: Kec. Wonokromo, Surabaya"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tahun Anggaran</label>
                  <input 
                    type="text" 
                    value={data.year}
                    onChange={(e) => onDataUpdate({ ...data, year: e.target.value })}
                    className="saas-input font-semibold text-sm"
                    placeholder="Contoh: 2026"
                  />
                </div>
              </div>
            </div>

            {/* Financial / Tax Configurations */}
            <div className="saas-card p-6 bg-white border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <DollarSign className="h-4.5 w-4.5 text-amber-500" /> Konfigurasi Keuangan &amp; Pajak
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Persentase PPN (%)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={vatPercent}
                      onChange={(e) => setVatPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input w-32 font-semibold text-sm"
                    />
                    <span className="text-xs text-slate-500 font-medium">
                      PPN regulasi saat ini: <strong>11%</strong> (PPN 12% direncanakan segera).
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="h-4 w-4 text-slate-500" /> Simulasi Pajak Proyek
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Fisik Konstruksi (RAB):</span>
                    <span className="font-bold text-slate-800">{formatRupiah(totalProjectCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pajak PPN ({vatPercent}%):</span>
                    <span className="font-bold text-slate-800">{formatRupiah(vat)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 font-black">
                    <span>Total RAB Kontrak Klien:</span>
                    <span className="text-amber-600">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Settings & Themes Card */}
            <div className="saas-card p-6 bg-white border border-slate-200 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-amber-500" /> Tampilan &amp; Personalisasi
              </h3>

              <div className="space-y-4">
                {/* BoQ View Layout */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Layout Default BoQ</label>
                  <select 
                    value={boqViewMode}
                    onChange={(e) => setBoqViewMode(e.target.value as 'grid' | 'card')}
                    className="saas-input font-semibold text-sm"
                  >
                    <option value="grid">Grid Spreadsheet (Tampilan Excel)</option>
                    <option value="card">Modul Kartu Visual (Tampilan Modern)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Atur gaya visual untuk tab Bill of Quantities (BoQ). Mode kartu memberikan visualisasi margin bar yang interaktif.
                  </p>
                </div>

                {/* Theme Mode selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tema Warna Antarmuka</label>
                  <select 
                    value={themeMode}
                    onChange={(e) => setThemeMode(e.target.value as 'light-saas' | 'opnsense')}
                    className="saas-input font-semibold text-sm"
                  >
                    <option value="light-saas">⚡ Modern Light SaaS (Amber Clean - Rekomendasi)</option>
                    <option value="opnsense">🌙 Modern Dark Pro (Midnight Glass)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Pilih tema visual aplikasi. Tema Modern Light SaaS menyajikan tampilan putih bersih dengan aksen Amber, sedangkan Modern Dark Pro menyajikan visual mode gelap glassmorphic yang premium.
                  </p>
                </div>

                {/* HSD Price Mode */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Target Edit Harga Dasar (HSD)</label>
                  <select 
                    value={hsdEditMode}
                    onChange={(e) => setHsdEditMode(e.target.value as 'rab' | 'rap')}
                    className="saas-input font-semibold text-sm"
                  >
                    <option value="rab">Harga RAB Kontrak (Klien)</option>
                    <option value="rap">Harga RAP Lapangan (Riil Kontraktor)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Pilih database harga dasar aktif yang ingin Anda ubah secara default di halaman Harga Dasar.
                  </p>
                </div>

                {/* Sidebar State Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="space-y-0.5 pr-3">
                    <div className="text-xs font-black text-slate-800 uppercase tracking-wider">Sembunyikan Sidebar Menu</div>
                    <p className="text-[10px] text-slate-500">Menciutkan menu navigasi di sisi kiri dan hanya menyisakan baris ikon.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={sidebarCollapsed}
                    onChange={(e) => setSidebarCollapsed(e.target.checked)}
                    className="w-4.5 h-4.5 text-amber-500 accent-amber-500 cursor-pointer shrink-0"
                  />
                </div>
              </div>
            </div>

            {/* ERP Health Indicator card */}
            <div className="saas-card p-6 bg-white border border-slate-200 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Calculator className="h-4.5 w-4.5 text-amber-500" /> Analisa Kesehatan Finansial
                </h3>
                
                <div className="space-y-3 mt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Total Anggaran RAP:</span>
                    <span className="font-bold text-slate-800">{formatRupiah(totalRap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Estimasi Keuntungan:</span>
                    <span className={`font-bold ${profitMarginPercent >= 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatRupiah(profitProjection)} ({profitMarginPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {profitMarginPercent < 10 ? (
                <div className="p-3.5 bg-amber-50 border border-amber-250 rounded-xl text-[10.5px] text-amber-800 leading-relaxed">
                  <AlertTriangle className="h-4 w-4 text-amber-650 inline-block mr-1.5 align-middle shrink-0" />
                  Rasio keuntungan tipis. Rekomendasi: sesuaikan koefisien AHSP untuk meningkatkan efisiensi.
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 border border-emerald-250 rounded-xl text-[10.5px] text-emerald-800 leading-relaxed">
                  Proyeksi margin profit proyek tergolong sehat dan aman untuk diajukan dalam penawaran.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Cloud Database & Data Integrity Card */}
      <div className="saas-card p-6 bg-white border border-slate-200 space-y-4 animate-fade-in">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <Cloud className="h-4.5 w-4.5 text-amber-500" /> Sinkronisasi Database Cloud (Supabase)
        </h3>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="space-y-1 max-w-xl">
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              Konektivitas Cloud:
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${syncStatus === 'success' ? 'bg-emerald-500' : syncStatus === 'loading' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Simpan seluruh data HSD, AHSP, BoQ, dan SMKK secara aman ke server Supabase Cloud terpusat. Ini memungkinkan sinkronisasi kolaboratif multi-pengguna.
            </p>
            {syncMessage && (
              <div className="text-[10px] font-bold text-amber-600 bg-amber-50/50 border border-amber-200/50 px-2.5 py-1 rounded-md mt-1.5 w-max">
                Status Terakhir: {syncMessage}
              </div>
            )}
          </div>

          <button
            onClick={handleSync}
            disabled={syncStatus === 'loading'}
            className="saas-button cursor-pointer h-10 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-full md:w-auto justify-center"
            type="button"
          >
            {syncStatus === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                Sinkronisasi...
              </>
            ) : (
              <>
                <Cloud className="h-4 w-4" />
                Simpan ke Cloud
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Unduh Cadangan Lokal</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Download berkas cadangan sesi ini dalam format berkas data JSON untuk diarsipkan di harddisk komputer Anda.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="saas-button-secondary py-2 text-[10.5px] uppercase font-extrabold w-max flex items-center gap-1.5 cursor-pointer mt-2"
              type="button"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-600" /> Ekspor JSON Cadangan
            </button>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Unggah Berkas Baru</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Ganti berkas proyek aktif ini dengan mengunggah lembar Excel (.xlsx) RAB lainnya ke sistem.
            </p>
            <button
              onClick={onUploadNew}
              className="saas-button-secondary py-2 text-[10.5px] uppercase font-extrabold w-max flex items-center gap-1.5 cursor-pointer mt-2"
              type="button"
            >
              <FileUp className="h-3.5 w-3.5 text-amber-600" /> Muat Excel Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
