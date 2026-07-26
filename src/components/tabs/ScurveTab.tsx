import React from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import type { RabData } from '../../utils/rabParser';

interface ScurveTabProps {
  data: RabData;
  scurveChartData: any;
  scurveOptions: any;
  handleScheduleChange: (divName: string, field: 'start' | 'end', val: number) => void;
  handleWeeksCountChange: (newCount: number) => void;
}

export const ScurveTab: React.FC<ScurveTabProps> = ({
  data,
  scurveChartData,
  scurveOptions,
  handleScheduleChange,
  handleWeeksCountChange
}) => {
  const weeksCount = data.weeksCount || 10;

  return (
    <div className="space-y-6 tab-slide-fade">
      {/* S-Curve Chart Card */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-amber-500" /> Analisa Jadwal Pelaksanaan & Kurva S
          </h3>
          <p className="text-[11px] text-slate-500 leading-normal mt-1">
            Berikut adalah Kurva S yang digenerasi secara matematis menggunakan distribusi normal (Bell Curve) dengan menyebarkan cost-weight per divisi pekerjaan di sepanjang durasi proyek.
          </p>
        </div>

        <div className="h-96 w-full chart-section">
          <Line data={scurveChartData} options={scurveOptions} />
        </div>
      </div>

      {/* Schedule Planner Sliders */}
      <div className="saas-card p-6 bg-white border border-slate-200 no-print animate-fade-in">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-amber-500" /> Atur Jadwal Kerja &amp; Bobot Progres per Divisi
        </h4>

        {/* Project Duration Configurator */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Durasi Proyek Rencana</h5>
            <p className="text-[10px] text-slate-500 mt-0.5">Ubah jangka waktu pelaksanaan proyek (dalam minggu).</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => handleWeeksCountChange(Math.max(4, weeksCount - 1))}
              className="saas-button py-1 px-3 cursor-pointer text-xs"
            >-</button>
            <span className="font-extrabold text-xs text-slate-800 bg-white border border-slate-200 px-4 py-1.5 rounded-lg">{weeksCount} Minggu</span>
            <button 
              type="button" 
              onClick={() => handleWeeksCountChange(Math.min(24, weeksCount + 1))}
              className="saas-button py-1 px-3 cursor-pointer text-xs"
            >+</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.rekap.map((item, idx) => {
            const sched = (data.divisionSchedules || {})[item.description] || { start: 1, end: weeksCount };
            
            return (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-2 hover:border-slate-350 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-bold text-slate-800 text-xs truncate max-w-[200px]" title={item.description}>
                    <span className="text-slate-400 font-bold mr-1.5">{item.no}</span>
                    {item.description}
                  </div>
                  <div className="text-[9px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-black shrink-0">
                    Minggu {sched.start} - {sched.end}
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-[10px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-450 font-bold">
                      <span>Mulai Pekerjaan (Minggu)</span>
                      <span className="text-slate-700 font-extrabold">{sched.start}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max={weeksCount} 
                      value={sched.start}
                      onChange={(e) => handleScheduleChange(item.description, 'start', parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-450 font-bold">
                      <span>Selesai Pekerjaan (Minggu)</span>
                      <span className="text-slate-700 font-extrabold">{sched.end}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max={weeksCount} 
                      value={sched.end}
                      onChange={(e) => handleScheduleChange(item.description, 'end', parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
