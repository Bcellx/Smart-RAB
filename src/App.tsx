import { useState, useEffect } from 'react';
import { ExcelParser } from './components/ExcelParser';
import { Dashboard } from './components/Dashboard';
import type { RabData } from './utils/rabParser';
import { Shield, Hammer, Check, RefreshCw } from 'lucide-react';
import { fetchProjectsList, loadProjectFromDb } from './utils/supabaseSync';

function App() {
  const [rabData, setRabData] = useState<RabData | null>(null);
  
  const [themeMode, setThemeMode] = useState<'light-saas' | 'opnsense'>(() => {
    return (localStorage.getItem('smartrab_theme_mode') as 'light-saas' | 'opnsense') || 'light-saas';
  });

  // Listen to theme changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const mode = (localStorage.getItem('smartrab_theme_mode') as 'light-saas' | 'opnsense') || 'light-saas';
      setThemeMode(mode);
    };
    window.addEventListener('storage', handleStorageChange);
    // Poll localstorage status occasionally as well in case of fast transitions
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newProjName, setNewProjName] = useState<string>('');
  const [newProjLoc, setNewProjLoc] = useState<string>('');
  const [newProjYear, setNewProjYear] = useState<string>('2026');
  
  const [projectList, setProjectList] = useState<Array<{ id: string; name: string; location: string; year: string; updated_at: string }>>([]);
  const [loadingDb, setLoadingDb] = useState<boolean>(false);

  // Fetch list of database projects on landing load
  useEffect(() => {
    const getProjects = async () => {
      try {
        const list = await fetchProjectsList();
        setProjectList(list);
      } catch (err) {
        console.warn('Gagal memuat daftar proyek dari database. Supabase mungkin belum berjalan.', err);
      }
    };
    if (!rabData) {
      getProjects();
    }
  }, [rabData]);

  const handleLoadProject = async (id: string) => {
    setLoadingDb(true);
    try {
      const projectData = await loadProjectFromDb(id);
      setRabData(projectData);
    } catch (err) {
      console.error(err);
      alert('Gagal memuat proyek dari database!');
    } finally {
      setLoadingDb(false);
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjLoc) return;

    const newProject: RabData = {
      projectName: newProjName,
      location: newProjLoc,
      year: newProjYear,
      rekap: [],
      boq: [],
      ahsp: [],
      labor: [],
      materials: [],
      smkk: [],
      rapLabor: [],
      rapMaterials: [],
      divisionSchedules: {}
    };

    setRabData(newProject);
    setShowCreateModal(false);
  };

  // Load from local storage on mount
  useEffect(() => {
    const cached = localStorage.getItem('smart_rab_workspace');
    if (cached) {
      try {
        setRabData(JSON.parse(cached));
      } catch (err) {
        console.error('Error loading cached RAB workspace:', err);
      }
    }
  }, []);

  // Sync state changes to local storage
  useEffect(() => {
    if (rabData) {
      localStorage.setItem('smart_rab_workspace', JSON.stringify(rabData));
    } else {
      localStorage.removeItem('smart_rab_workspace');
    }
  }, [rabData]);

  if (rabData) {
    return (
      <Dashboard 
        data={rabData} 
        onDataUpdate={setRabData} 
        onUploadNew={() => setRabData(null)}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden ${themeMode === 'opnsense' ? 'theme-opnsense' : 'theme-light-saas'}`}>
      {/* Background radial soft glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* LANDING HEADER */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md py-4 sticky top-0 z-40 shadow-sm no-print">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/10">
              <Hammer className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800">
                Smart <span className="text-amber-500">RAB</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Akurasi Estimasi Standar PUPR</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Shield className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Kepatuhan SE No. 47/SE/Dk/2026</span>
          </div>
        </div>
      </header>

      {/* LANDING MAIN HERO WORKSPACE */}
      <main className="max-w-6xl mx-auto px-4 py-16 flex-grow w-full flex items-center justify-center no-print">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Column: Hero Copywriting */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5" /> Construction Estimation ERP
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight">
              Penyusunan RAB &amp; Analisis Konstruksi Berbasis <span className="text-amber-500 border-b-4 border-amber-500/25">Standar PUPR</span>
            </h2>
            
            <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
              Otomatisasi pengolahan berkas rekapitulasi, kuantitas volume (BoQ), Harga Satuan Dasar (HSD), Analisa AHSP, dan Rencana Anggaran Pelaksanaan (RAP) dalam satu dasbor terintegrasi secara cepat dan presisi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/15 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Kalkulator Kurva S Progres</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Generasi penjadwalan cost-weight dinamis.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/15 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Margin &amp; RAP Cost Control</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Estimasi profitabilitas riil dan harga dasar.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/15 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Deteksi Kebutuhan Riil (BOM)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Akumulasi otomatis bahan dasar &amp; upah kerja.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/15 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Format Cetak Laporan Resmi</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Cetak spreadsheet grid standar kementerian.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Excel File Uploader Widget */}
          <div className="lg:col-span-5 w-full">
            <div className="saas-card bg-white p-6 border border-slate-200 shadow-md flex flex-col gap-4">
              <ExcelParser 
                onDataParsed={setRabData} 
                onLoadingStateChange={() => {}} 
              />
              
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Atau</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full saas-button cursor-pointer py-2.5 px-3 flex items-center justify-center gap-2"
                type="button"
              >
                <Hammer className="h-4 w-4" /> Buat Proyek Baru (Mulai dari Nol)
              </button>

              {/* Database projects list */}
              {projectList.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4 text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Buka Proyek Tersimpan (Database)</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {projectList.map(p => (
                      <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-250 rounded-lg hover:border-amber-400 transition-colors flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-800 text-xs truncate">{p.name}</h5>
                          <span className="text-[9px] text-slate-450 truncate block">{p.location} • TA {p.year}</span>
                        </div>
                        <button 
                          onClick={() => handleLoadProject(p.id)}
                          className="shrink-0 saas-button py-1 px-2.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                          type="button"
                        >
                          Buka
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* LANDING FOOTER */}
      <footer className="py-6 border-t border-slate-200 bg-white/40 backdrop-blur-sm text-center text-xs text-slate-400 no-print">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 font-medium">
          <div>
            &copy; {new Date().getFullYear()} Smart RAB. Rancang Bangun Estimasi Konstruksi Cepat &amp; Akurat.
          </div>
          <div className="flex gap-4 mt-2 sm:mt-0 text-[10px] font-bold text-slate-400">
            <span>Standar SE No. 47/SE/Dk/2026</span>
            <span>&bull;</span>
            <span>Akurasi PUPR</span>
          </div>
        </div>
      </footer>

      {/* CREATE EMPTY PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="saas-modal p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Hammer className="h-5 w-5 text-amber-500" /> Mulai Proyek RAB Baru
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Buat berkas rencana anggaran biaya kosong secara instan.</p>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Nama Proyek</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Pembangunan Rumah Tinggal T-50"
                  className="saas-input"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Lokasi Proyek</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Kec. Wonokromo, Surabaya"
                  className="saas-input"
                  value={newProjLoc}
                  onChange={(e) => setNewProjLoc(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Tahun Anggaran</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: 2026"
                  className="saas-input"
                  value={newProjYear}
                  onChange={(e) => setNewProjYear(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="saas-button-secondary flex-1 cursor-pointer py-2"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="saas-button flex-1 cursor-pointer py-2"
                >
                  Buat Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* LOADING DATABASE OVERLAY */}
      {loadingDb && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            <h4 className="font-bold text-slate-800 text-sm">Memuat data dari database...</h4>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
