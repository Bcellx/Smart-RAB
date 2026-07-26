import React from 'react';
import { 
  Building, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  FileSpreadsheet, 
  ShieldAlert, 
  Users, 
  Calculator, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  themeMode: 'light-saas' | 'opnsense';
  projectName: string;
  location: string;
  year: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  themeMode,
  projectName,
  location,
  year
}) => {
  return (
    <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 no-print border-r border-slate-950 transition-all duration-300`}>
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className={`p-4 flex items-center justify-between border-b border-slate-950 bg-slate-950/40 ${sidebarCollapsed ? 'flex-col gap-2' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500 rounded text-slate-950 shrink-0">
              <Building className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-base font-black tracking-tight text-white">Smart <span className="text-amber-500">RAB</span></h2>
                <span className="text-[9px] text-slate-500 font-extrabold tracking-widest uppercase">Construction ERP</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={sidebarCollapsed ? "Perluas Menu" : "Sembunyikan Menu"}
            type="button"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Active Project Details Card */}
        {!sidebarCollapsed && (
          <div className="m-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800 space-y-1 animate-fade-in">
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Proyek Aktif</span>
            <h4 className="text-xs font-bold text-slate-100 truncate">{projectName}</h4>
            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-500" /> {location}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-500" /> TA. {year}
            </div>
          </div>
        )}

        {/* Estimator Engine Status Widget (Active in Dark Pro mode) */}
        {!sidebarCollapsed && themeMode === 'opnsense' && (
          <div className="mx-3 mb-4 p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2 animate-fade-in text-[10px]">
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest block">Status Mesin Estimasi</span>
            
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Estimator Engine</span>
              <span className="font-extrabold text-[8.5px] uppercase text-emerald-400">Running</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> Database PUPR</span>
              <span className="font-extrabold text-[8.5px] uppercase text-emerald-400">Active</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> AHSP Auto-Linker</span>
              <span className="font-extrabold text-[8.5px] uppercase text-emerald-400">Connected</span>
            </div>
          </div>
        )}

        {/* Navigation Sidebar Menu */}
        <nav className="px-2.5 py-3 space-y-1">
          {themeMode === 'opnsense' ? (
            <>
              {!sidebarCollapsed && <div className="opnsense-sidebar-category">Lobby</div>}
              <button 
                onClick={() => setActiveTab('rekap')}
                className={`w-full flex items-center min-h-[40px] ${sidebarCollapsed ? 'justify-center py-2.5' : 'justify-start px-4 py-2.5'} text-[11px] font-bold uppercase tracking-wide rounded transition-all ${
                  activeTab === 'rekap' ? 'bg-slate-950 text-white border-l-[3.5px] border-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Dashboard" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <FileText className="h-[16px] w-[16px] text-orange-550 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  {!sidebarCollapsed && <span className="leading-none flex items-center">Dashboard</span>}
                </span>
              </button>

              {!sidebarCollapsed && <div className="opnsense-sidebar-category">Estimator</div>}
              <button 
                onClick={() => setActiveTab('boq')}
                className={`w-full flex items-center min-h-[40px] ${sidebarCollapsed ? 'justify-center py-2.5' : 'justify-start px-4 py-2.5'} text-[11px] font-bold uppercase tracking-wide rounded transition-all ${
                  activeTab === 'boq' ? 'bg-slate-950 text-white border-l-[3.5px] border-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Bill of Quantities" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <FileSpreadsheet className="h-[16px] w-[16px] text-orange-550 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  {!sidebarCollapsed && <span className="leading-none flex items-center">Bill of Quantities</span>}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('smkk')}
                className={`w-full flex items-center min-h-[40px] ${sidebarCollapsed ? 'justify-center py-2.5' : 'justify-start px-4 py-2.5'} text-[11px] font-bold uppercase tracking-wide rounded transition-all ${
                  activeTab === 'smkk' ? 'bg-slate-950 text-white border-l-[3.5px] border-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Biaya Penerapan K3" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <ShieldAlert className="h-[16px] w-[16px] text-orange-550 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  {!sidebarCollapsed && <span className="leading-none flex items-center">Biaya Penerapan K3</span>}
                </span>
              </button>

              {!sidebarCollapsed && <div className="opnsense-sidebar-category">Database</div>}
              <button 
                onClick={() => setActiveTab('hsd')}
                className={`w-full flex items-center min-h-[40px] ${sidebarCollapsed ? 'justify-center py-2.5' : 'justify-start px-4 py-2.5'} text-[11px] font-bold uppercase tracking-wide rounded transition-all ${
                  activeTab === 'hsd' ? 'bg-slate-950 text-white border-l-[3.5px] border-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Harga Dasar (HSD)" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Users className="h-[16px] w-[16px] text-orange-550 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  {!sidebarCollapsed && <span className="leading-none flex items-center">Harga Dasar (HSD)</span>}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('ahsp')}
                className={`w-full flex items-center min-h-[40px] ${sidebarCollapsed ? 'justify-center py-2.5' : 'justify-start px-4 py-2.5'} text-[11px] font-bold uppercase tracking-wide rounded transition-all ${
                  activeTab === 'ahsp' ? 'bg-slate-950 text-white border-l-[3.5px] border-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Analisa Satuan (AHSP)" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Calculator className="h-[16px] w-[16px] text-orange-550 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  {!sidebarCollapsed && <span className="leading-none flex items-center">Analisa Satuan (AHSP)</span>}
                </span>
              </button>

              {!sidebarCollapsed && <div className="opnsense-sidebar-category">Analisa &amp; Kontrol</div>}
              <button 
                onClick={() => setActiveTab('bom')}
                className={`w-full flex items-center min-h-[40px] ${sidebarCollapsed ? 'justify-center py-2.5' : 'justify-start px-4 py-2.5'} text-[11px] font-bold uppercase tracking-wide rounded transition-all ${
                  activeTab === 'bom' ? 'bg-slate-950 text-white border-l-[3.5px] border-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Kebutuhan Riil (BOM)" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Layers className="h-[16px] w-[16px] text-orange-550 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  {!sidebarCollapsed && <span className="leading-none flex items-center">Kebutuhan Riil (BOM)</span>}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('scurve')}
                className={`w-full flex items-center min-h-[40px] ${sidebarCollapsed ? 'justify-center py-2.5' : 'justify-start px-4 py-2.5'} text-[11px] font-bold uppercase tracking-wide rounded transition-all ${
                  activeTab === 'scurve' ? 'bg-slate-950 text-white border-l-[3.5px] border-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Kurva S Penjadwalan" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <TrendingUp className="h-[16px] w-[16px] text-orange-550 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  {!sidebarCollapsed && <span className="leading-none flex items-center">Kurva S Penjadwalan</span>}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('margin')}
                className={`w-full flex items-center min-h-[40px] ${sidebarCollapsed ? 'justify-center py-2.5' : 'justify-start px-4 py-2.5'} text-[11px] font-bold uppercase tracking-wide rounded transition-all ${
                  activeTab === 'margin' ? 'bg-slate-950 text-white border-l-[3.5px] border-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Margin & RAP (ERP)" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <DollarSign className="h-[16px] w-[16px] text-orange-550 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  {!sidebarCollapsed && <span className="leading-none flex items-center">Margin &amp; RAP (ERP)</span>}
                </span>
              </button>

              {!sidebarCollapsed && <div className="opnsense-sidebar-category">System</div>}
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center min-h-[40px] ${sidebarCollapsed ? 'justify-center py-2.5' : 'justify-start px-4 py-2.5'} text-[11px] font-bold uppercase tracking-wide rounded transition-all ${
                  activeTab === 'settings' ? 'bg-slate-950 text-white border-l-[3.5px] border-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Konfigurasi Sistem" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Settings className="h-[16px] w-[16px] text-orange-550 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  {!sidebarCollapsed && <span className="leading-none flex items-center">Konfigurasi Sistem</span>}
                </span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('rekap')}
                className={`w-full flex items-center min-h-[44px] ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${
                  activeTab === 'rekap' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Rekapitulasi Biaya" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <FileText className="h-[18px] w-[18px] shrink-0" />
                  {!sidebarCollapsed && <span>Rekapitulasi</span>}
                </span>
                {!sidebarCollapsed && <ChevronRight className={`h-3.5 w-3.5 transition-opacity ${activeTab === 'rekap' ? 'opacity-80' : 'opacity-40'}`} />}
              </button>
              
              <button 
                onClick={() => setActiveTab('boq')}
                className={`w-full flex items-center min-h-[44px] ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${
                  activeTab === 'boq' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Bill of Quantities (BoQ)" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <FileSpreadsheet className="h-[18px] w-[18px] shrink-0" />
                  {!sidebarCollapsed && <span>Bill of Quantities</span>}
                </span>
                {!sidebarCollapsed && <ChevronRight className={`h-3.5 w-3.5 transition-opacity ${activeTab === 'boq' ? 'opacity-80' : 'opacity-40'}`} />}
              </button>
              
              <button 
                onClick={() => setActiveTab('ahsp')}
                className={`w-full flex items-center min-h-[44px] ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${
                  activeTab === 'ahsp' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Analisa Satuan (AHSP)" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Calculator className="h-[18px] w-[18px] shrink-0" />
                  {!sidebarCollapsed && <span>Analisa Satuan (AHSP)</span>}
                </span>
                {!sidebarCollapsed && <ChevronRight className={`h-3.5 w-3.5 transition-opacity ${activeTab === 'ahsp' ? 'opacity-80' : 'opacity-40'}`} />}
              </button>
              
              <button 
                onClick={() => setActiveTab('hsd')}
                className={`w-full flex items-center min-h-[44px] ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${
                  activeTab === 'hsd' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Harga Satuan Dasar (HSD)" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Users className="h-[18px] w-[18px] shrink-0" />
                  {!sidebarCollapsed && <span>Harga Dasar (HSD)</span>}
                </span>
                {!sidebarCollapsed && <ChevronRight className={`h-3.5 w-3.5 transition-opacity ${activeTab === 'hsd' ? 'opacity-80' : 'opacity-40'}`} />}
              </button>

              {!sidebarCollapsed && (
                <div className="pt-2 pb-1 px-1">
                  <div className="text-[8px] font-black text-slate-650 uppercase tracking-[0.15em]">Fitur Lanjutan</div>
                </div>
              )}
              
              <button 
                onClick={() => setActiveTab('bom')}
                className={`w-full flex items-center min-h-[44px] ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${
                  activeTab === 'bom' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Kebutuhan Riil (BOM)" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Layers className="h-[18px] w-[18px] shrink-0" />
                  {!sidebarCollapsed && <span>Kebutuhan Riil (BOM)</span>}
                </span>
                {!sidebarCollapsed && <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-orange-600 text-white font-black uppercase shrink-0 tracking-wider">PRO</span>}
              </button>
              
              <button 
                onClick={() => setActiveTab('scurve')}
                className={`w-full flex items-center min-h-[44px] ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${
                  activeTab === 'scurve' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Kurva S Penjadwalan" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <TrendingUp className="h-[18px] w-[18px] shrink-0" />
                  {!sidebarCollapsed && <span>Kurva S Penjadwalan</span>}
                </span>
                {!sidebarCollapsed && <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-orange-600 text-white font-black uppercase shrink-0 tracking-wider">PRO</span>}
              </button>
   
              <button 
                onClick={() => setActiveTab('margin')}
                className={`w-full flex items-center min-h-[44px] ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${
                  activeTab === 'margin' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Margin & RAP (ERP)" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <DollarSign className="h-[18px] w-[18px] shrink-0" />
                  {!sidebarCollapsed && <span>Margin &amp; RAP (ERP)</span>}
                </span>
                {!sidebarCollapsed && <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-violet-600 text-white font-black uppercase shrink-0 tracking-wider">ERP</span>}
              </button>
   
              <button 
                onClick={() => setActiveTab('smkk')}
                className={`w-full flex items-center min-h-[44px] ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${
                  activeTab === 'smkk' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Biaya Penerapan K3" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <ShieldAlert className="h-[18px] w-[18px] shrink-0" />
                  {!sidebarCollapsed && <span>Biaya Penerapan K3</span>}
                </span>
                {!sidebarCollapsed && <ChevronRight className={`h-3.5 w-3.5 transition-opacity ${activeTab === 'smkk' ? 'opacity-80' : 'opacity-40'}`} />}
              </button>
  
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center min-h-[44px] ${sidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} text-[11px] font-bold uppercase tracking-wide rounded-xl transition-all ${
                  activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } cursor-pointer`}
                title={sidebarCollapsed ? "Konfigurasi Sistem" : undefined}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <Settings className="h-[18px] w-[18px] shrink-0" />
                  {!sidebarCollapsed && <span>Konfigurasi Sistem</span>}
                </span>
                {!sidebarCollapsed && <ChevronRight className={`h-3.5 w-3.5 transition-opacity ${activeTab === 'settings' ? 'opacity-80' : 'opacity-40'}`} />}
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-slate-850 bg-slate-950/10 text-[9px] text-slate-600 text-center font-bold uppercase tracking-widest">
          Smart RAB ERP &copy; {new Date().getFullYear()}
        </div>
      )}
    </aside>
  );
};
