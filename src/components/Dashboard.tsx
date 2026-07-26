import React, { useState, useEffect } from 'react';
import { 
  Calculator 
} from 'lucide-react';
import { recalculateRab } from '../utils/rabParser';
import type { RabData } from '../utils/rabParser';
import { syncToSupabase } from '../utils/supabaseSync';

// Sub-components layout
import { Sidebar } from './dashboard/Sidebar';
import { Header } from './dashboard/Header';

// Tab components
import { RekapTab } from './tabs/RekapTab';
import { BoqTab } from './tabs/BoqTab';
import { AhspTab } from './tabs/AhspTab';
import { HsdTab } from './tabs/HsdTab';
import { BomTab } from './tabs/BomTab';
import { ScurveTab } from './tabs/ScurveTab';
import { MarginTab } from './tabs/MarginTab';
import { K3Tab } from './tabs/K3Tab';
import { ConfigTab } from './tabs/ConfigTab';

// Modal components
import { AddHsdModal } from './dashboard/modals/AddHsdModal';
import { AddDivisionModal } from './dashboard/modals/AddDivisionModal';
import { AddBoqItemModal } from './dashboard/modals/AddBoqItemModal';
import { AddAhspModal } from './dashboard/modals/AddAhspModal';
import { EditAhspModal } from './dashboard/modals/EditAhspModal';

interface DashboardProps {
  data: RabData;
  onDataUpdate: (newData: RabData) => void;
  onUploadNew: () => void;
}

type TabType = 'rekap' | 'boq' | 'ahsp' | 'hsd' | 'bom' | 'scurve' | 'margin' | 'smkk' | 'settings';

interface BomRow {
  code: string;
  name: string;
  unit: string;
  quantity: number;
  rate: number;
  cost: number;
  type: 'labor' | 'material' | 'equipment';
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onDataUpdate, onUploadNew }) => {
  const [activeTab, setActiveTab] = useState<TabType>('rekap');
  const [expandedAhs, setExpandedAhs] = useState<string | null>(null);
  
  const [hsdEditMode, setHsdEditMode] = useState<'rab' | 'rap'>('rab');

  const [editingBoqRapNo, setEditingBoqRapNo] = useState<string | null>(null);
  const [editingBoqRapValue, setEditingBoqRapValue] = useState<string>('');
  
  const [editingBoqVolNo, setEditingBoqVolNo] = useState<string | null>(null);
  const [editingBoqVolValue, setEditingBoqVolValue] = useState<string>('');

  const [editingBoqPriceNo, setEditingBoqPriceNo] = useState<string | null>(null);
  const [editingBoqPriceValue, setEditingBoqPriceValue] = useState<string>('');

  const [editingAhsComp, setEditingAhsComp] = useState<{ ahsCode: string; type: 'labor' | 'material' | 'equipment'; code: string } | null>(null);
  const [editingAhsCompValue, setEditingAhsCompValue] = useState<string>('');

  const [editingAhsOverheadCode, setEditingAhsOverheadCode] = useState<string | null>(null);
  const [editingAhsOverheadValue, setEditingAhsOverheadValue] = useState<string>('');
  
  const [boqViewMode, setBoqViewMode] = useState<'grid' | 'card'>(() => {
    return (localStorage.getItem('smartrab_boq_view_mode') as 'grid' | 'card') || 'grid';
  });
  
  const [vatPercent, setVatPercent] = useState<number>(() => {
    const cached = localStorage.getItem('smartrab_vat_percent');
    return cached ? parseFloat(cached) : 11;
  });

  const [themeMode, setThemeMode] = useState<'light-saas' | 'opnsense'>(() => {
    return (localStorage.getItem('smartrab_theme_mode') as 'light-saas' | 'opnsense') || 'light-saas';
  });

  const [targetMargin, setTargetMargin] = useState<number>(10);

  // States for Modals
  const [showAddHsdModal, setShowAddHsdModal] = useState<boolean>(false);
  const [showAddAhspModal, setShowAddAhspModal] = useState<boolean>(false);
  const [showEditAhspModal, setShowEditAhspModal] = useState<boolean>(false);
  const [editingAhsCode, setEditingAhsCode] = useState<string | null>(null);
  const [showAddDivisionModal, setShowAddDivisionModal] = useState<boolean>(false);
  const [showAddBoqModal, setShowAddBoqModal] = useState<boolean>(false);
  const [selectedDivForBoq, setSelectedDivForBoq] = useState<string>('');

  // Search states
  const [hsdSearch, setHsdSearch] = useState<string>('');
  const [ahsSearch, setAhsSearch] = useState<string>('');

  // Sync state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Toast for changes
  const [priceDelta, setPriceDelta] = useState<{ diff: number; direction: 'up' | 'down'; oldTotal: number; newTotal: number } | null>(null);

  // Collapse sidebar menu
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('smartrab_sidebar_collapsed') === 'true';
  });

  // Save layout configurations in storage
  useEffect(() => {
    localStorage.setItem('smartrab_boq_view_mode', boqViewMode);
  }, [boqViewMode]);

  useEffect(() => {
    localStorage.setItem('smartrab_vat_percent', String(vatPercent));
  }, [vatPercent]);

  useEffect(() => {
    localStorage.setItem('smartrab_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('smartrab_theme_mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const hasForced = localStorage.getItem('smartrab_forced_light_saas_default_v2');
    if (!hasForced) {
      setThemeMode('light-saas');
      localStorage.setItem('smartrab_theme_mode', 'light-saas');
      localStorage.setItem('smartrab_forced_light_saas_default_v2', 'true');
    }
  }, []);

  // Initialize defaults
  useEffect(() => {
    const wCount = data.weeksCount || 10;
    if (data && (!data.rapLabor || !data.rapMaterials || !data.divisionSchedules || !data.weeksCount)) {
      const initialSchedules: { [key: string]: { start: number; end: number } } = {};
      const divisionsCount = data.rekap.length;
      data.rekap.forEach((item, idx) => {
        const start = Math.min(Math.floor(idx * (Math.max(1, wCount - 4) / Math.max(1, divisionsCount))) + 1, Math.max(1, wCount - 3));
        const duration = Math.min(Math.max(3, Math.floor(wCount / Math.max(1, divisionsCount))), 5);
        const end = Math.min(start + duration, wCount);
        initialSchedules[item.description] = { start, end };
      });

      onDataUpdate({
        ...data,
        weeksCount: wCount,
        rapLabor: data.rapLabor || data.labor.map(l => ({ ...l })),
        rapMaterials: data.rapMaterials || data.materials.map(m => ({ ...m })),
        divisionSchedules: data.divisionSchedules || initialSchedules
      });
    }
  }, [data, onDataUpdate]);

  // Sync to database
  const handleSync = async () => {
    setSyncStatus('loading');
    setSyncMessage('Menghubungkan & menyimpan ke database...');
    const result = await syncToSupabase(data);
    if (result.success) {
      setSyncStatus('success');
      setSyncMessage(result.message);
      setTimeout(() => setSyncStatus('idle'), 5000);
    } else {
      setSyncStatus('error');
      setSyncMessage(result.message);
    }
  };

  // Helper formatting
  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Calculations
  const totalProjectCost = data.rekap.reduce((acc, r) => acc + r.totalPrice, 0);
  const vat = totalProjectCost * (vatPercent / 100);
  const grandTotal = totalProjectCost + vat;
  const totalSmkk = data.smkk.reduce((acc, s) => s.isHeader ? acc : acc + s.totalPrice, 0);
  const smkkPercent = totalProjectCost > 0 ? (totalSmkk / totalProjectCost) * 100 : 0;
  const boqItemCount = data.boq.filter(b => !b.isHeader).length;

  // BOM Engine
  const getBomData = (): BomRow[] => {
    const bomMap: { [key: string]: BomRow } = {};
    data.boq.forEach(boqItem => {
      if (boqItem.isHeader || !boqItem.ahsCode) return;
      const matchingAhs = data.ahsp.find(ahs => ahs.code === boqItem.ahsCode);
      if (!matchingAhs) return;
      const vol = boqItem.volume || 0;
      
      matchingAhs.labor.forEach(l => {
        const key = `labor-${l.code}`;
        if (!bomMap[key]) bomMap[key] = { code: l.code, name: l.type, unit: l.unit, quantity: 0, rate: l.rate, cost: 0, type: 'labor' };
        bomMap[key].quantity += l.coefficient * vol;
      });
      matchingAhs.materials.forEach(m => {
        const key = `material-${m.code}`;
        if (!bomMap[key]) bomMap[key] = { code: m.code, name: m.name, unit: m.unit, quantity: 0, rate: m.rate, cost: 0, type: 'material' };
        bomMap[key].quantity += m.coefficient * vol;
      });
      matchingAhs.equipment.forEach(e => {
        const key = `equipment-${e.code}`;
        if (!bomMap[key]) bomMap[key] = { code: e.code, name: e.name, unit: e.unit, quantity: 0, rate: e.rate, cost: 0, type: 'equipment' };
        bomMap[key].quantity += e.coefficient * vol;
      });
    });
    return Object.values(bomMap)
      .map(row => ({ ...row, cost: row.quantity * row.rate }))
      .filter(row => row.quantity > 0)
      .sort((a, b) => b.cost - a.cost);
  };

  const bomList = getBomData();
  const bomLabor = bomList.filter(b => b.type === 'labor');
  const bomMaterials = bomList.filter(b => b.type === 'material');
  const bomEquipment = bomList.filter(b => b.type === 'equipment');

  const laborSum = bomLabor.reduce((acc, b) => acc + b.cost, 0);
  const materialSum = bomMaterials.reduce((acc, b) => acc + b.cost, 0);
  const equipmentSum = bomEquipment.reduce((acc, b) => acc + b.cost, 0);

  // RAP Calculation
  let totalRap = 0;
  data.boq.forEach(boqItem => {
    if (boqItem.isHeader) return;
    if (boqItem.rapUnitPrice !== undefined && boqItem.rapUnitPrice !== null) {
      totalRap += boqItem.rapUnitPrice * boqItem.volume;
      return;
    }
    if (boqItem.ahsCode) {
      const matchingAhs = data.ahsp.find(ahs => ahs.code === boqItem.ahsCode);
      if (matchingAhs) {
        let divLabor = 0;
        matchingAhs.labor.forEach(l => {
          const rate = (data.rapLabor || data.labor).find(rl => rl.code === l.code)?.rate ?? l.rate;
          divLabor += l.coefficient * rate;
        });
        let divMaterial = 0;
        matchingAhs.materials.forEach(m => {
          const rate = (data.rapMaterials || data.materials).find(rm => rm.code === m.code)?.rate ?? m.rate;
          divMaterial += m.coefficient * rate;
        });
        let divEquip = 0;
        matchingAhs.equipment.forEach(e => {
          divEquip += e.coefficient * e.rate;
        });
        const ahsRapDirectCost = divLabor + divMaterial + divEquip;
        if (ahsRapDirectCost > 0) {
          totalRap += ahsRapDirectCost * boqItem.volume;
          return;
        }
      }
    }
    totalRap += (boqItem.unitPrice / 1.15) * boqItem.volume;
  });

  const profitProjection = totalProjectCost - totalRap;
  const profitMarginPercent = totalProjectCost > 0 ? (profitProjection / totalProjectCost) * 100 : 0;

  // BoQ Vol/Price Changes
  const handleBoqRapChange = (no: string, newRate: number) => {
    const oldTotalRap = totalRap;
    const updatedBoq = data.boq.map(item => item.no === no ? { ...item, rapUnitPrice: newRate } : item);
    
    // Calculate new total RAP budget dynamically to show delta toast alert
    let newTotalRap = 0;
    updatedBoq.forEach(boqItem => {
      if (boqItem.isHeader) return;
      if (boqItem.rapUnitPrice !== undefined && boqItem.rapUnitPrice !== null) {
        newTotalRap += boqItem.rapUnitPrice * boqItem.volume;
        return;
      }
      newTotalRap += (boqItem.unitPrice / 1.15) * boqItem.volume;
    });

    onDataUpdate({ ...data, boq: updatedBoq });

    if (Math.abs(newTotalRap - oldTotalRap) > 1) {
      setPriceDelta({
        diff: Math.abs(newTotalRap - oldTotalRap),
        direction: newTotalRap > oldTotalRap ? 'up' : 'down',
        oldTotal: oldTotalRap,
        newTotal: newTotalRap
      });
    }
  };

  const handleBoqVolChange = (no: string, newVol: number) => {
    const updatedBoq = data.boq.map(item => item.no === no ? { ...item, volume: newVol, totalPrice: newVol * item.unitPrice } : item);
    onDataUpdate(recalculateRab({ ...data, boq: updatedBoq }));
  };

  const handleBoqPriceChange = (no: string, newPrice: number) => {
    const updatedBoq = data.boq.map(item => item.no === no ? { ...item, unitPrice: newPrice, totalPrice: item.volume * newPrice } : item);
    onDataUpdate(recalculateRab({ ...data, boq: updatedBoq }));
  };

  // AHSP Changes
  const handleAhsCoefficientChange = (ahsCode: string, type: 'labor' | 'material' | 'equipment', compCode: string, newCoeff: number) => {
    const updatedAhsp = data.ahsp.map(ahs => {
      if (ahs.code === ahsCode) {
        const updateCompList = (list: any[]) => list.map(item => item.code === compCode ? { ...item, coefficient: newCoeff } : item);
        let labor = ahs.labor;
        let materials = ahs.materials;
        let equipment = ahs.equipment;

        if (type === 'labor') labor = updateCompList(labor);
        else if (type === 'material') materials = updateCompList(materials);
        else if (type === 'equipment') equipment = updateCompList(equipment);

        let totalLabor = labor.reduce((acc, l) => acc + l.coefficient * l.rate, 0);
        let totalMaterial = materials.reduce((acc, m) => acc + m.coefficient * m.rate, 0);
        let totalEquipment = equipment.reduce((acc, e) => acc + e.coefficient * e.rate, 0);
        let directCost = totalLabor + totalMaterial + totalEquipment;
        let overheadCost = directCost * (ahs.overheadPercent / 100);
        let unitPrice = directCost + overheadCost;

        return { ...ahs, labor, materials, equipment, totalLabor, totalMaterial, totalEquipment, directCost, overheadCost, unitPrice };
      }
      return ahs;
    });

    onDataUpdate(recalculateRab({ ...data, ahsp: updatedAhsp }));
  };

  const handleAhsOverheadChange = (ahsCode: string, newOverhead: number) => {
    const updatedAhsp = data.ahsp.map(ahs => {
      if (ahs.code === ahsCode) {
        let overheadCost = ahs.directCost * (newOverhead / 100);
        let unitPrice = ahs.directCost + overheadCost;
        return { ...ahs, overheadPercent: newOverhead, overheadCost, unitPrice };
      }
      return ahs;
    });

    onDataUpdate(recalculateRab({ ...data, ahsp: updatedAhsp }));
  };

  const handleAutoFillRap = () => {
    const updatedBoq = data.boq.map(item => {
      if (item.isHeader) return item;
      let defaultRap = 0;
      if (item.ahsCode) {
        const matchingAhs = data.ahsp.find(ahs => ahs.code === item.ahsCode);
        if (matchingAhs) {
          let divLabor = 0;
          matchingAhs.labor.forEach(l => {
            const rate = (data.rapLabor || data.labor).find(rl => rl.code === l.code)?.rate ?? l.rate;
            divLabor += l.coefficient * rate;
          });
          let divMaterial = 0;
          matchingAhs.materials.forEach(m => {
            const rate = (data.rapMaterials || data.materials).find(rm => rm.code === m.code)?.rate ?? m.rate;
            divMaterial += m.coefficient * rate;
          });
          let divEquip = 0;
          matchingAhs.equipment.forEach(e => {
            divEquip += e.coefficient * e.rate;
          });
          defaultRap = divLabor + divMaterial + divEquip;
        }
      }
      if (defaultRap === 0) defaultRap = item.unitPrice / 1.15;
      return { ...item, rapUnitPrice: Math.round(defaultRap) };
    });

    onDataUpdate({ ...data, boq: updatedBoq });
  };

  const handleResetRap = () => {
    const updatedBoq = data.boq.map(item => {
      if (item.isHeader) return item;
      const { rapUnitPrice: _rapUnitPrice, ...rest } = item;
      return rest;
    });
    onDataUpdate({ ...data, boq: updatedBoq });
  };

  // Schedule Slider Changes
  const handleScheduleChange = (divName: string, field: 'start' | 'end', val: number) => {
    const wCount = data.weeksCount || 10;
    const schedules = { ...(data.divisionSchedules || {}) };
    if (!schedules[divName]) schedules[divName] = { start: 1, end: wCount };
    
    if (field === 'start') {
      schedules[divName].start = Math.min(val, schedules[divName].end);
    } else {
      schedules[divName].end = Math.max(val, schedules[divName].start);
    }
    onDataUpdate({ ...data, divisionSchedules: schedules });
  };

  const handleWeeksCountChange = (newCount: number) => {
    onDataUpdate({ ...data, weeksCount: newCount });
  };

  // Basic Price HSD Changes
  const handleHsdPriceChange = (type: 'labor' | 'material', code: string, newRate: number) => {
    if (hsdEditMode === 'rab') {
      const oldGrandTotal = grandTotal;
      const updatedLabor = [...data.labor];
      const updatedMaterials = [...data.materials];

      if (type === 'labor') {
        const idx = updatedLabor.findIndex(l => l.code === code);
        if (idx !== -1) updatedLabor[idx] = { ...updatedLabor[idx], rate: newRate };
      } else {
        const idx = updatedMaterials.findIndex(m => m.code === code);
        if (idx !== -1) updatedMaterials[idx] = { ...updatedMaterials[idx], rate: newRate };
      }

      const newData = recalculateRab({ ...data, labor: updatedLabor, materials: updatedMaterials });
      onDataUpdate(newData);

      const newTotalFisik = newData.rekap.reduce((acc, r) => acc + r.totalPrice, 0);
      const newGrandTotal = newTotalFisik * (1 + vatPercent / 100);

      if (Math.abs(newGrandTotal - oldGrandTotal) > 1) {
        setPriceDelta({
          diff: Math.abs(newGrandTotal - oldGrandTotal),
          direction: newGrandTotal > oldGrandTotal ? 'up' : 'down',
          oldTotal: oldGrandTotal,
          newTotal: newGrandTotal
        });
      }
    } else {
      const oldTotalRap = totalRap;
      const updatedRapLabor = [...(data.rapLabor || data.labor)];
      const updatedRapMaterials = [...(data.rapMaterials || data.materials)];

      if (type === 'labor') {
        const idx = updatedRapLabor.findIndex(l => l.code === code);
        if (idx !== -1) updatedRapLabor[idx] = { ...updatedRapLabor[idx], rate: newRate };
      } else {
        const idx = updatedRapMaterials.findIndex(m => m.code === code);
        if (idx !== -1) updatedRapMaterials[idx] = { ...updatedRapMaterials[idx], rate: newRate };
      }

      // Calculate new total RAP budget dynamically
      let newTotalRap = 0;
      data.boq.forEach(boqItem => {
        if (boqItem.isHeader || !boqItem.ahsCode) return;
        const matchingAhs = data.ahsp.find(ahs => ahs.code === boqItem.ahsCode);
        if (!matchingAhs) return;
        
        let divLabor = 0;
        matchingAhs.labor.forEach(l => {
          const rate = updatedRapLabor.find(rl => rl.code === l.code)?.rate ?? l.rate;
          divLabor += l.coefficient * rate;
        });
        
        let divMaterial = 0;
        matchingAhs.materials.forEach(m => {
          const rate = updatedRapMaterials.find(rm => rm.code === m.code)?.rate ?? m.rate;
          divMaterial += m.coefficient * rate;
        });
        
        let divEquip = 0;
        matchingAhs.equipment.forEach(e => {
          divEquip += e.coefficient * e.rate;
        });
        
        newTotalRap += (divLabor + divMaterial + divEquip) * boqItem.volume;
      });

      onDataUpdate({ ...data, rapLabor: updatedRapLabor, rapMaterials: updatedRapMaterials });

      if (Math.abs(newTotalRap - oldTotalRap) > 1) {
        setPriceDelta({
          diff: Math.abs(newTotalRap - oldTotalRap),
          direction: newTotalRap > oldTotalRap ? 'up' : 'down',
          oldTotal: oldTotalRap,
          newTotal: newTotalRap
        });
      }
    }
  };

  const handleOpenEditAhs = (code: string) => {
    setEditingAhsCode(code);
    setShowEditAhspModal(true);
  };

  // AHSP Actions
  const handleDuplicateAhs = (code: string) => {
    const src = data.ahsp.find(a => a.code === code);
    if (!src) return;
    const newCode = `${src.code}_COPY`;
    if (data.ahsp.some(a => a.code === newCode)) {
      alert(`Kode "${newCode}" sudah ada.`);
      return;
    }
    onDataUpdate({ ...data, ahsp: [...data.ahsp, { ...src, code: newCode, name: `${src.name} (Salinan)` }] });
  };

  const handleDeleteAhs = (code: string) => {
    if (!window.confirm(`Hapus analisa "${code}"?`)) return;
    onDataUpdate({ ...data, ahsp: data.ahsp.filter(a => a.code !== code) });
  };

  // Backup downloader
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Smart_RAB_${data.projectName.replace(/\s+/g, '_')}_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // SMKK Price Changes
  const handleSmkkPriceChange = (no: string, newPrice: number) => {
    const updatedSmkk = data.smkk.map(item => item.no === no ? { ...item, unitPrice: newPrice, totalPrice: item.volume * newPrice } : item);
    onDataUpdate({ ...data, smkk: updatedSmkk });
  };

  // S-Curve Coordinates
  const getScurveData = () => {
    const wCount = data.weeksCount || 10;
    const weeklyCosts = Array(wCount).fill(0);
    
    data.rekap.forEach((item) => {
      const price = item.totalPrice;
      if (price <= 0) return;
      
      const sched = (data.divisionSchedules || {})[item.description] || { start: 1, end: wCount };
      const startWeek = Math.max(1, Math.min(sched.start, wCount));
      const endWeek = Math.max(startWeek, Math.min(sched.end, wCount));
      
      // Calculate normal (bell curve) distribution weights
      const mu = (startWeek + endWeek) / 2;
      const duration = endWeek - startWeek + 1;
      const sigma = Math.max(0.5, duration / 4); // avoid division by zero or very small sigma
      
      let sumOfF = 0;
      const fValues = [];
      
      for (let w = startWeek; w <= endWeek; w++) {
        // Normal distribution formula
        const f = Math.exp(-Math.pow(w - mu, 2) / (2 * Math.pow(sigma, 2)));
        fValues.push({ week: w, f });
        sumOfF += f;
      }
      
      // Distribute the cost based on normalized weights
      fValues.forEach(({ week, f }) => {
        const weight = sumOfF > 0 ? f / sumOfF : 1 / duration;
        const weekIdx = week - 1;
        if (weekIdx >= 0 && weekIdx < wCount) {
          weeklyCosts[weekIdx] += price * weight;
        }
      });
    });
    
    let cumulativeCost = 0;
    const datasetWeeklyWeight: number[] = [];
    const datasetCumulativeWeight: number[] = [];
    
    weeklyCosts.forEach(cost => {
      const weight = totalProjectCost > 0 ? (cost / totalProjectCost) * 100 : 0;
      cumulativeCost += cost;
      const cumWeight = totalProjectCost > 0 ? (cumulativeCost / totalProjectCost) * 100 : 0;
      
      datasetWeeklyWeight.push(parseFloat(weight.toFixed(2)));
      datasetCumulativeWeight.push(parseFloat(cumWeight.toFixed(2)));
    });
    
    return {
      labels: Array.from({ length: wCount }, (_, i) => `Mg ${i + 1}`),
      datasetWeeklyWeight,
      datasetCumulativeWeight
    };
  };

  const scurveDetails = getScurveData();
  const scurveChartData = {
    labels: scurveDetails.labels,
    datasets: [
      {
        label: 'Kurva S Kumulatif (%)',
        data: scurveDetails.datasetCumulativeWeight,
        borderColor: '#f97316',
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: '#ea580c',
        pointRadius: 4,
        yAxisID: 'yCumulative',
      },
      {
        label: 'Progres Mingguan (%)',
        data: scurveDetails.datasetWeeklyWeight,
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(29, 78, 216, 0.1)',
        borderWidth: 1.5,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#1d4ed8',
        pointRadius: 3,
        yAxisID: 'yWeekly',
      }
    ]
  };

  const scurveOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { font: { family: 'Outfit', size: 10 } } },
      title: { display: true, text: `KURVA S PREDIKSI PROGRES FISIK PROYEK (${data.weeksCount || 10} MINGGU)`, font: { family: 'Outfit', size: 12, weight: 'bold' as const } }
    },
    scales: {
      x: { grid: { display: false } },
      yWeekly: {
        type: 'linear' as const,
        position: 'left' as const,
        title: { display: true, text: 'Progres Mingguan (%)', font: { family: 'Outfit', size: 10 } },
        ticks: { callback: (val: any) => `${val}%` },
        grid: { color: '#f1f5f9' }
      },
      yCumulative: {
        type: 'linear' as const,
        position: 'right' as const,
        title: { display: true, text: 'Kumulatif S-Curve (%)', font: { family: 'Outfit', size: 10 } },
        ticks: { callback: (val: any) => `${val}%` },
        min: 0,
        max: 100,
        grid: { display: false }
      }
    }
  };

  // Recap chart settings
  const rekapChartData = {
    labels: data.rekap.map(r => r.description.length > 15 ? r.description.substring(0, 15) + '...' : r.description),
    datasets: [
      {
        label: 'Biaya Pekerjaan',
        data: data.rekap.map(r => r.totalPrice),
        backgroundColor: 'rgba(29, 78, 216, 0.75)',
        borderColor: '#1d4ed8',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const rekapChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'PERSENTASE DIVISI PEKERJAAN', font: { family: 'Outfit', size: 11, weight: 'bold' as const } }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { callback: (value: any) => value >= 1000000 ? (value / 1000000) + ' Jt' : value }
      }
    }
  };

  const directBreakdownData = {
    labels: ['Tenaga Kerja', 'Bahan Konstruksi', 'Alat/Mesin'],
    datasets: [
      {
        data: [laborSum, materialSum, equipmentSum],
        backgroundColor: ['#8b5cf6', '#f97316', '#14b8a6'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2
      }
    ]
  };

  const directBreakdownOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { font: { family: 'Outfit', size: 10 } } },
      title: { display: true, text: 'KOMPOSISI BIAYA LANGSUNG', font: { family: 'Outfit', size: 11, weight: 'bold' as const } }
    }
  };

  // Auto-dismiss delta toast
  useEffect(() => {
    if (priceDelta) {
      const timer = setTimeout(() => {
        setPriceDelta(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [priceDelta]);

  return (
    <div className={`h-screen overflow-hidden flex bg-slate-50 text-slate-900 ${themeMode === 'opnsense' ? 'theme-opnsense' : 'theme-light-saas'}`}>
      
      {/* 1. LEFT SIDEBAR */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        themeMode={themeMode}
        projectName={data.projectName}
        location={data.location}
        year={data.year}
      />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Dynamic header */}
        <Header 
          projectName={data.projectName}
          activeTab={activeTab}
          grandTotal={grandTotal}
          handlePrint={() => window.print()}
          formatRupiah={formatRupiah}
        />

        {/* Scrollable central content area */}
        <div className="flex-1 p-6 overflow-y-auto pr-2">
          
          {/* Toast Notification for Delta Pricing Changes */}
          {priceDelta && (
            <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-xl shadow-xl z-50 border border-slate-750 flex items-start gap-3 max-w-sm animate-fade-in no-print">
              <span className="p-1.5 bg-amber-500 rounded text-slate-950 mt-0.5">
                <Calculator className="h-4 w-4" />
              </span>
              <div className="text-xs space-y-1">
                <h5 className="font-extrabold uppercase tracking-wide text-amber-500">Harga Satuan Dikalkulasi!</h5>
                <p>Harga dasar diubah. Nilai total anggaran berubah sebesar:</p>
                <div className="font-black text-sm">
                  {priceDelta.direction === 'up' ? '+' : '-'} {formatRupiah(priceDelta.diff)}
                </div>
                <div className="text-[10px] text-slate-400">
                  Total lama: {formatRupiah(priceDelta.oldTotal)} → Baru: {formatRupiah(priceDelta.newTotal)}
                </div>
              </div>
            </div>
          )}

          {/* RENDER ACTIVE TAB */}
          {activeTab === 'rekap' && (
            <RekapTab 
              data={data}
              totalProjectCost={totalProjectCost}
              grandTotal={grandTotal}
              totalRap={totalRap}
              totalSmkk={totalSmkk}
              smkkPercent={smkkPercent}
              vatPercent={vatPercent}
              vat={vat}
              formatRupiah={formatRupiah}
              rekapChartData={rekapChartData}
              rekapChartOptions={rekapChartOptions}
              directBreakdownData={directBreakdownData}
              directBreakdownOptions={directBreakdownOptions}
            />
          )}

          {activeTab === 'boq' && (
            <BoqTab 
              data={data}
              formatRupiah={formatRupiah}
              setActiveTab={(tab: any) => setActiveTab(tab)}
              setExpandedAhs={setExpandedAhs}
              boqViewMode={boqViewMode}
              setBoqViewMode={setBoqViewMode}
              boqItemCount={boqItemCount}
              editingBoqRapNo={editingBoqRapNo}
              setEditingBoqRapNo={setEditingBoqRapNo}
              editingBoqRapValue={editingBoqRapValue}
              setEditingBoqRapValue={setEditingBoqRapValue}
              editingBoqVolNo={editingBoqVolNo}
              setEditingBoqVolNo={setEditingBoqVolNo}
              editingBoqVolValue={editingBoqVolValue}
              setEditingBoqVolValue={setEditingBoqVolValue}
              editingBoqPriceNo={editingBoqPriceNo}
              setEditingBoqPriceNo={setEditingBoqPriceNo}
              editingBoqPriceValue={editingBoqPriceValue}
              setEditingBoqPriceValue={setEditingBoqPriceValue}
              handleBoqRapChange={handleBoqRapChange}
              handleBoqVolChange={handleBoqVolChange}
              handleBoqPriceChange={handleBoqPriceChange}
              handleAutoFillRap={handleAutoFillRap}
              handleResetRap={handleResetRap}
              setShowAddDivisionModal={setShowAddDivisionModal}
              setShowAddBoqModal={setShowAddBoqModal}
              setSelectedDivForBoq={setSelectedDivForBoq}
            />
          )}

          {activeTab === 'ahsp' && (
            <AhspTab 
              formatRupiah={formatRupiah}
              expandedAhs={expandedAhs}
              setExpandedAhs={setExpandedAhs}
              filteredAhsp={data.ahsp.filter(a => a.name.toLowerCase().includes(ahsSearch.toLowerCase()) || a.code.toLowerCase().includes(ahsSearch.toLowerCase()))}
              editingAhsComp={editingAhsComp}
              setEditingAhsComp={setEditingAhsComp}
              editingAhsCompValue={editingAhsCompValue}
              setEditingAhsCompValue={setEditingAhsCompValue}
              editingAhsOverheadCode={editingAhsOverheadCode}
              setEditingAhsOverheadCode={setEditingAhsOverheadCode}
              editingAhsOverheadValue={editingAhsOverheadValue}
              setEditingAhsOverheadValue={setEditingAhsOverheadValue}
              handleAhsCoefficientChange={handleAhsCoefficientChange}
              handleAhsOverheadChange={handleAhsOverheadChange}
              handleOpenEditAhs={handleOpenEditAhs}
              handleDuplicateAhs={handleDuplicateAhs}
              handleDeleteAhs={handleDeleteAhs}
              setShowAddAhspModal={setShowAddAhspModal}
              ahsSearch={ahsSearch}
              setAhsSearch={setAhsSearch}
            />
          )}

          {activeTab === 'hsd' && (
            <HsdTab 
              data={data}
              formatRupiah={formatRupiah}
              hsdActiveSubTab={hsdEditMode === 'rab' ? 'labor' : 'materials'}
              setHsdActiveSubTab={(tab) => setHsdEditMode(tab === 'labor' ? 'rab' : 'rap')}
              hsdSearch={hsdSearch}
              setHsdSearch={setHsdSearch}
              editingHsdCode={editingBoqRapNo}
              setEditingHsdCode={setEditingBoqRapNo}
              editingHsdValue={editingBoqRapValue}
              setEditingHsdValue={setEditingBoqRapValue}
              handleHsdPriceChange={handleHsdPriceChange}
              setShowAddHsdModal={setShowAddHsdModal}
            />
          )}

          {activeTab === 'bom' && (
            <BomTab 
              bomLabor={bomLabor}
              bomMaterials={bomMaterials}
            />
          )}

          {activeTab === 'scurve' && (
            <ScurveTab 
              data={data}
              scurveChartData={scurveChartData}
              scurveOptions={scurveOptions}
              handleScheduleChange={handleScheduleChange}
              handleWeeksCountChange={handleWeeksCountChange}
            />
          )}

          {activeTab === 'margin' && (
            <MarginTab 
              data={data}
              formatRupiah={formatRupiah}
              grandTotal={grandTotal}
              totalRap={totalRap}
              targetMargin={targetMargin}
              setTargetMargin={setTargetMargin}
              editingBoqRapNo={editingBoqRapNo}
              setEditingBoqRapNo={setEditingBoqRapNo}
              editingBoqRapValue={editingBoqRapValue}
              setEditingBoqRapValue={setEditingBoqRapValue}
              handleBoqRapChange={handleBoqRapChange}
              handleAutoFillRap={handleAutoFillRap}
              handleResetRap={handleResetRap}
            />
          )}

          {activeTab === 'smkk' && (
            <K3Tab 
              data={data}
              formatRupiah={formatRupiah}
              totalSmkk={totalSmkk}
              smkkPercent={smkkPercent}
              editingSmkkNo={editingBoqRapNo}
              setEditingSmkkNo={setEditingBoqRapNo}
              editingSmkkValue={editingBoqRapValue}
              setEditingSmkkValue={setEditingBoqRapValue}
              handleSmkkPriceChange={handleSmkkPriceChange}
            />
          )}

          {activeTab === 'settings' && (
            <ConfigTab 
              data={data}
              onDataUpdate={onDataUpdate}
              vatPercent={vatPercent}
              setVatPercent={setVatPercent}
              totalProjectCost={totalProjectCost}
              vat={vat}
              grandTotal={grandTotal}
              formatRupiah={formatRupiah}
              boqViewMode={boqViewMode}
              setBoqViewMode={setBoqViewMode}
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              hsdEditMode={hsdEditMode}
              setHsdEditMode={setHsdEditMode}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              syncStatus={syncStatus}
              syncMessage={syncMessage}
              handleSync={handleSync}
              handleDownloadBackup={handleDownloadBackup}
              onUploadNew={onUploadNew}
              profitMarginPercent={profitMarginPercent}
              profitProjection={profitProjection}
              totalRap={totalRap}
            />
          )}

        </div>

        {/* ─── MODAL DIALOGS OVERLAYS ─── */}
        <AddHsdModal 
          isOpen={showAddHsdModal} 
          onClose={() => setShowAddHsdModal(false)} 
          data={data} 
          onDataUpdate={onDataUpdate} 
        />

        <AddDivisionModal 
          isOpen={showAddDivisionModal} 
          onClose={() => setShowAddDivisionModal(false)} 
          data={data} 
          onDataUpdate={onDataUpdate} 
        />

        <AddBoqItemModal 
          isOpen={showAddBoqModal} 
          onClose={() => setShowAddBoqModal(false)} 
          data={data} 
          onDataUpdate={onDataUpdate} 
          initialDivision={selectedDivForBoq} 
        />

        <AddAhspModal 
          isOpen={showAddAhspModal} 
          onClose={() => setShowAddAhspModal(false)} 
          data={data} 
          onDataUpdate={onDataUpdate} 
        />

        <EditAhspModal 
          isOpen={showEditAhspModal} 
          onClose={() => { setShowEditAhspModal(false); setEditingAhsCode(null); }} 
          data={data} 
          onDataUpdate={onDataUpdate} 
          editingAhsCode={editingAhsCode} 
        />

        {/* Print Layout Signature Block */}
        <div className="hidden print:block p-8 border-t-2 border-slate-900 avoid-break mt-12">
          <div className="flex justify-between text-xs">
            <div className="text-center w-48">
              <div>Disetujui Oleh:</div>
              <div className="mt-16 font-bold border-b border-black pb-1 uppercase">PPK / Pemilik Proyek</div>
              <div className="text-[10px] text-slate-500">NIP. .........................</div>
            </div>
            <div className="text-center w-48">
              <div>Dibuat Oleh:</div>
              <div className="mt-16 font-bold border-b border-black pb-1 uppercase">Estimator / Kontraktor</div>
              <div className="text-[10px] text-slate-500">Jabatan: Penanggung Jawab</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
