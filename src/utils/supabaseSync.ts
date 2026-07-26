import { supabase } from './supabaseClient';
import type { RabData } from './rabParser';

export const syncToSupabase = async (data: RabData): Promise<{ success: boolean; message: string; projectId?: string }> => {
  // Verifikasi apakah kunci anonim ada
  const hasAnonKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!hasAnonKey) {
    return {
      success: false,
      message: 'Supabase Anon Key belum diatur di file .env. Pastikan Anda telah membuat berkas .env dan memasukkan VITE_SUPABASE_ANON_KEY hasil dari "npx supabase start" atau panel Supabase Cloud Anda.'
    };
  }
  
  try {
    let projectId = data.id;

    if (projectId) {
      // 1. Update data Proyek utama ke tabel projects
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          name: data.projectName,
          location: data.location,
          year: data.year,
          weeks_count: data.weeksCount || 10,
          schedules: data.divisionSchedules || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
        
      if (projectError) throw projectError;

      // Bersihkan data relasi anak lama
      await supabase.from('materials').delete().eq('project_id', projectId);
      await supabase.from('labor').delete().eq('project_id', projectId);
      await supabase.from('ahsp').delete().eq('project_id', projectId);
      await supabase.from('boq').delete().eq('project_id', projectId);
      await supabase.from('smkk').delete().eq('project_id', projectId);
    } else {
      // 2. Simpan data Proyek utama ke tabel projects
      const { data: projectRecord, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: data.projectName,
          location: data.location,
          year: data.year,
          weeks_count: data.weeksCount || 10,
          schedules: data.divisionSchedules || {}
        })
        .select()
        .single();
        
      if (projectError) throw projectError;
      projectId = projectRecord.id;
    }
    
    // 3. Simpan Daftar Bahan ke tabel materials
    if (data.materials.length > 0) {
      const rapMats = data.rapMaterials || [];
      const materialsToInsert = data.materials.map(m => {
        const rap = rapMats.find(rm => rm.code === m.code);
        return {
          project_id: projectId,
          code: m.code,
          name: m.name,
          unit: m.unit,
          rate: m.rate,
          rap_rate: rap ? rap.rate : m.rate
        };
      });
      const { error: matError } = await supabase.from('materials').insert(materialsToInsert);
      if (matError) throw matError;
    }
    
    // 4. Simpan Daftar Upah Tenaga Kerja ke tabel labor
    if (data.labor.length > 0) {
      const rapLabs = data.rapLabor || [];
      const laborToInsert = data.labor.map(l => {
        const rap = rapLabs.find(rl => rl.code === l.code);
        return {
          project_id: projectId,
          code: l.code,
          name: l.name,
          unit: l.unit,
          rate: l.rate,
          rap_rate: rap ? rap.rate : l.rate
        };
      });
      const { error: labError } = await supabase.from('labor').insert(laborToInsert);
      if (labError) throw labError;
    }
    
    // 5. Simpan Analisa Harga Satuan (AHSP) beserta detail komponennya
    if (data.ahsp.length > 0) {
      for (const ahs of data.ahsp) {
        const { data: ahsRecord, error: ahsError } = await supabase
          .from('ahsp')
          .insert({
            project_id: projectId,
            code: ahs.code,
            name: ahs.name,
            unit: ahs.unit,
            overhead_percent: ahs.overheadPercent,
            direct_cost: ahs.directCost,
            overhead_cost: ahs.overheadCost,
            unit_price: ahs.unitPrice
          })
          .select()
          .single();
          
        if (ahsError) throw ahsError;
        
        const detailsToInsert: any[] = [];
        
        // Tenaga Kerja dalam AHSP
        ahs.labor.forEach(l => {
          detailsToInsert.push({
            ahsp_id: ahsRecord.id,
            type: 'labor',
            code: l.code,
            name: l.type,
            unit: l.unit,
            coefficient: l.coefficient,
            rate: l.rate,
            cost: l.cost
          });
        });
        
        // Bahan dalam AHSP
        ahs.materials.forEach(m => {
          detailsToInsert.push({
            ahsp_id: ahsRecord.id,
            type: 'material',
            code: m.code,
            name: m.name,
            unit: m.unit,
            coefficient: m.coefficient,
            rate: m.rate,
            cost: m.cost
          });
        });
        
        // Alat dalam AHSP
        ahs.equipment.forEach(e => {
          detailsToInsert.push({
            ahsp_id: ahsRecord.id,
            type: 'equipment',
            code: e.code,
            name: e.name,
            unit: e.unit,
            coefficient: e.coefficient,
            rate: e.rate,
            cost: e.cost
          });
        });
        
        if (detailsToInsert.length > 0) {
          const { error: detailsError } = await supabase
            .from('ahsp_details')
            .insert(detailsToInsert);
          if (detailsError) throw detailsError;
        }
      }
    }
    
    // 6. Simpan Bill of Quantities (BoQ) ke tabel boq
    if (data.boq.length > 0) {
      const boqToInsert = data.boq.map(b => ({
        project_id: projectId,
        no: b.no,
        description: b.description,
        unit: b.unit,
        volume: b.volume,
        unit_price: b.unitPrice,
        total_price: b.totalPrice,
        is_header: b.isHeader,
        ahs_code: b.ahsCode,
        rap_unit_price: b.rapUnitPrice
      }));
      const { error: boqError } = await supabase.from('boq').insert(boqToInsert);
      if (boqError) throw boqError;
    }
    
    // 7. Simpan Rincian Biaya SMKK ke tabel smkk
    if (data.smkk.length > 0) {
      const smkkToInsert = data.smkk.map(s => ({
        project_id: projectId,
        no: s.no,
        description: s.description,
        unit: s.unit,
        volume: s.volume,
        unit_price: s.unitPrice,
        total_price: s.totalPrice,
        is_header: s.isHeader
      }));
      const { error: smkkError } = await supabase.from('smkk').insert(smkkToInsert);
      if (smkkError) throw smkkError;
    }
    
    return {
      success: true,
      message: 'Sinkronisasi berhasil! Seluruh data RAB telah berhasil disimpan di PostgreSQL.',
      projectId
    };
  } catch (err: any) {
    console.error('Error syncing data:', err);
    return {
      success: false,
      message: `Gagal sinkronisasi data: ${err.message || err}`
    };
  }
};

export const fetchProjectsList = async (): Promise<Array<{ id: string; name: string; location: string; year: string; updated_at: string; weeks_count: number }>> => {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, location, year, updated_at, weeks_count')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const loadProjectFromDb = async (projectId: string): Promise<RabData> => {
  // Muat proyek
  const { data: project, error: projError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  if (projError) throw projError;
  
  // Muat bahan
  const { data: materials, error: matError } = await supabase
    .from('materials')
    .select('*')
    .eq('project_id', projectId);
  if (matError) throw matError;
  
  // Muat upah
  const { data: labor, error: labError } = await supabase
    .from('labor')
    .select('*')
    .eq('project_id', projectId);
  if (labError) throw labError;
  
  // Muat AHSP dengan detail
  const { data: ahspRecords, error: ahsError } = await supabase
    .from('ahsp')
    .select('*, ahsp_details(*)')
    .eq('project_id', projectId);
  if (ahsError) throw ahsError;
  
  // Muat BoQ
  const { data: boq, error: boqError } = await supabase
    .from('boq')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (boqError) throw boqError;
  
  // Muat SMKK
  const { data: smkk, error: smkkError } = await supabase
    .from('smkk')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (smkkError) throw smkkError;
  
  // Rakit kembali list HSD
  const laborList = (labor || []).map(l => ({
    code: l.code,
    name: l.name,
    unit: l.unit,
    rate: Number(l.rate)
  }));
  const rapLaborList = (labor || []).map(l => ({
    code: l.code,
    name: l.name,
    unit: l.unit,
    rate: Number(l.rap_rate || l.rate)
  }));
  
  const materialList = (materials || []).map(m => ({
    code: m.code,
    name: m.name,
    unit: m.unit,
    rate: Number(m.rate)
  }));
  const rapMaterialList = (materials || []).map(m => ({
    code: m.code,
    name: m.name,
    unit: m.unit,
    rate: Number(m.rap_rate || m.rate)
  }));
  
  // Rakit kembali list AHSP
  const ahspList = (ahspRecords || []).map(a => {
    const details = a.ahsp_details || [];
    
    const labComponents = details.filter((d: any) => d.type === 'labor').map((d: any) => ({
      type: d.name,
      code: d.code,
      unit: d.unit,
      coefficient: Number(d.coefficient),
      rate: Number(d.rate),
      cost: Number(d.cost)
    }));
    
    const matComponents = details.filter((d: any) => d.type === 'material').map((d: any) => ({
      name: d.name,
      code: d.code,
      unit: d.unit,
      coefficient: Number(d.coefficient),
      rate: Number(d.rate),
      cost: Number(d.cost)
    }));
    
    const equipComponents = details.filter((d: any) => d.type === 'equipment').map((d: any) => ({
      name: d.name,
      code: d.code,
      unit: d.unit,
      coefficient: Number(d.coefficient),
      rate: Number(d.rate),
      cost: Number(d.cost)
    }));
    
    return {
      code: a.code,
      name: a.name,
      unit: a.unit,
      overheadPercent: Number(a.overhead_percent),
      directCost: Number(a.direct_cost),
      overheadCost: Number(a.overhead_cost),
      unitPrice: Number(a.unit_price),
      labor: labComponents,
      materials: matComponents,
      equipment: equipComponents,
      totalLabor: Number(a.direct_cost) - (matComponents.reduce((sum: number, x: any) => sum + x.cost, 0) + equipComponents.reduce((sum: number, x: any) => sum + x.cost, 0)),
      totalMaterial: matComponents.reduce((sum: number, x: any) => sum + x.cost, 0),
      totalEquipment: equipComponents.reduce((sum: number, x: any) => sum + x.cost, 0),
    };
  });
  
  // Rakit kembali BoQ
  const boqList = (boq || []).map(b => ({
    no: b.no,
    description: b.description,
    unit: b.unit,
    volume: Number(b.volume),
    unitPrice: Number(b.unit_price),
    totalPrice: Number(b.total_price),
    isHeader: b.is_header,
    ahsCode: b.ahs_code || undefined,
    rapUnitPrice: b.rap_unit_price ? Number(b.rap_unit_price) : undefined
  }));
  
  // Rakit kembali SMKK
  const smkkList = (smkk || []).map(s => ({
    no: s.no,
    description: s.description,
    unit: s.unit,
    volume: Number(s.volume),
    unitPrice: Number(s.unit_price),
    totalPrice: Number(s.total_price),
    isHeader: s.is_header
  }));
  
  return {
    id: project.id,
    projectName: project.name,
    location: project.location,
    year: project.year,
    weeksCount: Number(project.weeks_count || 10),
    divisionSchedules: project.schedules || {},
    labor: laborList,
    rapLabor: rapLaborList,
    materials: materialList,
    rapMaterials: rapMaterialList,
    ahsp: ahspList,
    boq: boqList,
    rekap: (boqList || []).filter(b => b.isHeader).map(b => ({
      no: b.no,
      description: b.description,
      totalPrice: 0
    })),
    smkk: smkkList
  };
};
