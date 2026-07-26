import { utils } from 'xlsx';

export interface LaborItem {
  type: string;
  code: string;
  unit: string;
  coefficient: number;
  rate: number;
  cost: number;
}

export interface MaterialItem {
  name: string;
  code: string;
  unit: string;
  coefficient: number;
  rate: number;
  cost: number;
}

export interface EquipmentItem {
  name: string;
  code: string;
  unit: string;
  coefficient: number;
  rate: number;
  cost: number;
}

export interface AhspItem {
  code: string;
  name: string;
  unit: string;
  labor: LaborItem[];
  materials: MaterialItem[];
  equipment: EquipmentItem[];
  totalLabor: number;
  totalMaterial: number;
  totalEquipment: number;
  directCost: number; // A + B + C
  overheadPercent: number; // e.g. 15 or 10
  overheadCost: number;
  unitPrice: number; // directCost + overheadCost
}

export interface BoqItem {
  no: string;
  description: string;
  unit: string;
  volume: number;
  unitPrice: number;
  totalPrice: number;
  isHeader: boolean;
  ahsCode?: string;
  rapUnitPrice?: number;
}

export interface RekapItem {
  no: string;
  description: string;
  totalPrice: number;
}

export interface SmkkItem {
  no: string;
  description: string;
  unit: string;
  volume: number;
  unitPrice: number;
  totalPrice: number;
  isHeader: boolean;
}

export interface HsdItem {
  code: string;
  name: string;
  unit: string;
  rate: number;
}

export interface RabData {
  id?: string;
  weeksCount?: number;
  projectName: string;
  location: string;
  year: string;
  rekap: RekapItem[];
  boq: BoqItem[];
  ahsp: AhspItem[];
  labor: HsdItem[];
  materials: HsdItem[];
  smkk: SmkkItem[];
  rapLabor?: HsdItem[];
  rapMaterials?: HsdItem[];
  divisionSchedules?: { [key: string]: { start: number; end: number } };
}

// Clean text cells
const cleanStr = (val: any): string => {
  if (val === null || val === undefined) return '';
  return String(val).trim();
};

const parseFloatVal = (val: any): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseWorkbook = (workbook: any): RabData => {
  const data: RabData = {
    projectName: 'PERENCANAAN PEMBANGUNAN TOILET',
    location: 'KOTA SORONG',
    year: '2026',
    rekap: [],
    boq: [],
    ahsp: [],
    labor: [],
    materials: [],
    smkk: []
  };

  // 1. PARSE UPAH
  const upahSheet = workbook.Sheets['Upah'];
  if (upahSheet) {
    const rows = utils.sheet_to_json<any[]>(upahSheet, { header: 1 });
    let isData = false;
    for (const row of rows) {
      if (!row || row.length === 0) continue;
      const firstCell = cleanStr(row[0]);
      if (firstCell.toLowerCase().includes('kode') || firstCell.toLowerCase().includes('uraian')) {
        isData = true;
        continue;
      }
      if (isData) {
        const code = cleanStr(row[0]);
        const name = cleanStr(row[1]);
        const unit = cleanStr(row[2]);
        const rate = parseFloatVal(row[3]);
        if (name && rate > 0) {
          data.labor.push({ code, name, unit, rate });
        }
      }
    }
  }

  // 2. PARSE BAHAN
  const bahanSheet = workbook.Sheets['Bahan'] || workbook.Sheets['Bahan (2)'];
  if (bahanSheet) {
    const rows = utils.sheet_to_json<any[]>(bahanSheet, { header: 1 });
    let isData = false;
    for (const row of rows) {
      if (!row || row.length === 0) continue;
      // In materials, header might have "No" in index 1 or index 2
      const text = row.map(cleanStr).join(' ');
      if (text.toLowerCase().includes('uraian') && text.toLowerCase().includes('satuan') && text.toLowerCase().includes('harga')) {
        isData = true;
        continue;
      }
      if (isData) {
        // Let's search columns: index 1 or 2 is name, index 2 or 3 is unit, index 3 or 4 is price
        // Clean empty cells
        const cleanRow = row.map(cleanStr);
        let name = '';
        let unit = '';
        let price = 0;
        let code = '';

        if (cleanRow[2] && cleanRow[3] && cleanRow[4]) {
          // structure: ['', 'No', 'Uraian', 'Satuan', 'Harga']
          code = cleanRow[1];
          name = cleanRow[2];
          unit = cleanRow[3];
          price = parseFloatVal(cleanRow[4]);
        } else if (cleanRow[1] && cleanRow[2] && cleanRow[3]) {
          // structure: ['No', 'Uraian', 'Satuan', 'Harga']
          code = cleanRow[0];
          name = cleanRow[1];
          unit = cleanRow[2];
          price = parseFloatVal(cleanRow[3]);
        }

        if (name && price > 0 && !name.toUpperCase().startsWith('HARGA') && !name.toUpperCase().startsWith('KOTA') && !name.toUpperCase().startsWith('TAHUN')) {
          data.materials.push({
            code: code || `M-${data.materials.length + 1}`,
            name,
            unit,
            rate: price
          });
        }
      }
    }
  }

  // Fallback to BESIC PRICE if Bahan sheet didn't yield enough
  if (data.materials.length === 0) {
    const basicSheet = workbook.Sheets['BESIC PRICE'];
    if (basicSheet) {
      const rows = utils.sheet_to_json<any[]>(basicSheet, { header: 1 });
      let isData = false;
      for (const row of rows) {
        if (!row) continue;
        const text = row.map(cleanStr).join(' ');
        if (text.toLowerCase().includes('nama bahan') || text.toLowerCase().includes('hrg satuan')) {
          isData = true;
          continue;
        }
        if (isData) {
          const name = cleanStr(row[1]);
          const unit = cleanStr(row[2]);
          const rate = parseFloatVal(row[3]);
          if (name && rate > 0 && !name.includes('BAHAN') && !name.includes('No.')) {
            data.materials.push({
              code: cleanStr(row[0]) || `M-${data.materials.length + 1}`,
              name,
              unit,
              rate
            });
          }
        }
      }
    }
  }

  // 3. PARSE ANALISA (AHSP)
  const analisaSheet = workbook.Sheets['Analisa 24'] || workbook.Sheets['Analisa'];
  if (analisaSheet) {
    const rows = utils.sheet_to_json<any[]>(analisaSheet, { header: 1 });
    let currentAhs: AhspItem | null = null;
    let currentSection: 'labor' | 'material' | 'equipment' | null = null;

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      if (!row || row.length === 0) continue;

      const cells = row.map(cleanStr);
      const rowText = cells.join(' ');

      // Detect start of a new AHS block
      // A new block usually has an AHS code at index 1 (or index 2) like '1.1.1.1', 'A.2.2.1.1' or matching a pattern,
      // and the title is in index 2 or 3.
      // E.g., Row 9: ['', '1.1.1.1', 'Pek. Pembuatan 1 m1 Pagar...']
      const possibleCode = cells[1] || cells[0];
      const possibleTitle = cells[2] || cells[1];

      // A typical code fits a dot notation: e.g. 1.1.1.1 or A.2.2.1
      const isAhsCodePattern = /^\d+(\.\d+)+$/.test(possibleCode) || /^[A-Z](\.\d+)+$/.test(possibleCode);
      const isAhsHeader = isAhsCodePattern && possibleTitle && possibleTitle.length > 5 && !possibleTitle.toLowerCase().includes('lihat');

      if (isAhsHeader) {
        // Save previous AHS block if exists
        if (currentAhs) {
          // Calculate direct cost
          currentAhs.directCost = currentAhs.totalLabor + currentAhs.totalMaterial + currentAhs.totalEquipment;
          currentAhs.overheadCost = currentAhs.directCost * (currentAhs.overheadPercent / 100);
          currentAhs.unitPrice = currentAhs.directCost + currentAhs.overheadCost;
          data.ahsp.push(currentAhs);
        }

        // Initialize new block
        currentAhs = {
          code: possibleCode,
          name: possibleTitle,
          unit: 'M1', // Default, we will find this in cells or sub-row
          labor: [],
          materials: [],
          equipment: [],
          totalLabor: 0,
          totalMaterial: 0,
          totalEquipment: 0,
          directCost: 0,
          overheadPercent: 15, // Default overhead limit, we will read it if found
          overheadCost: 0,
          unitPrice: 0
        };
        currentSection = null;

        // Try to parse the unit from the title, e.g. "Pek. Pembuatan 1 m1 Pagar..." -> unit is "m1" or "M2" or "M3"
        const unitMatch = possibleTitle.match(/(\d+)\s*(m1|m2|m3|ls|bh|set|org|oh|kg|m'|btg)/i);
        if (unitMatch) {
          currentAhs.unit = unitMatch[2].toUpperCase();
        }
        continue;
      }

      if (!currentAhs) continue;

      // Detect sections inside the block
      if (rowText.includes('TENAGA KERJA') && !rowText.includes('JUMLAH')) {
        currentSection = 'labor';
        continue;
      } else if (rowText.includes('BAHAN') && !rowText.includes('JUMLAH')) {
        currentSection = 'material';
        continue;
      } else if (rowText.includes('PERALATAN') && !rowText.includes('JUMLAH')) {
        currentSection = 'equipment';
        continue;
      }

      // Check section totals
      if (rowText.includes('JUMLAH HARGA TENAGA KERJA')) {
        currentAhs.totalLabor = parseFloatVal(cells[cells.length - 1] || cells[cells.length - 2]);
        currentSection = null;
        continue;
      } else if (rowText.includes('JUMLAH HARGA BAHAN')) {
        currentAhs.totalMaterial = parseFloatVal(cells[cells.length - 1] || cells[cells.length - 2]);
        currentSection = null;
        continue;
      } else if (rowText.includes('JUMLAH HARGA PERALATAN')) {
        currentAhs.totalEquipment = parseFloatVal(cells[cells.length - 1] || cells[cells.length - 2]);
        currentSection = null;
        continue;
      }

      // Detect Overhead percentage
      if (rowText.includes('Overhead') || rowText.includes('Profit') || rowText.includes('Keuntungan')) {
        // Try to extract overhead percentage from text, e.g., "Overhead & Profit (15 %)"
        const percentMatch = rowText.match(/(\d+)\s*%/);
        if (percentMatch) {
          currentAhs.overheadPercent = parseFloat(percentMatch[1]);
        }
        currentAhs.overheadCost = parseFloatVal(cells[cells.length - 1] || cells[cells.length - 2]);
        continue;
      }

      // Detect unit price (end of block)
      if (rowText.includes('Harga Satuan Pekerjaan') || rowText.includes('HP (Jumlah)')) {
        currentAhs.unitPrice = parseFloatVal(cells[cells.length - 1] || cells[cells.length - 2]);
        // Save and reset currentAhs
        currentAhs.directCost = currentAhs.totalLabor + currentAhs.totalMaterial + currentAhs.totalEquipment;
        if (currentAhs.overheadCost === 0) {
          currentAhs.overheadCost = currentAhs.directCost * (currentAhs.overheadPercent / 100);
        }
        data.ahsp.push(currentAhs);
        currentAhs = null;
        currentSection = null;
        continue;
      }

      // Parse item row within section
      if (currentSection) {
        // Cells format: ['', '', 'No', 'Uraian', 'Kode', 'Satuan', 'Koefisien', 'Harga Satuan', 'Jumlah Harga']
        // Indices: index 3 is description, index 4 is code, index 5 is unit, index 6 is coeff, index 7 is rate, index 8 is cost
        // Let's parse them dynamically based on non-empty cells
        const name = cells[3];
        const itemCode = cells[4];
        const itemUnit = cells[5];
        const coeff = parseFloatVal(cells[6]);
        const rate = parseFloatVal(cells[7]);
        const cost = parseFloatVal(cells[8]);

        if (name && coeff > 0) {
          if (currentSection === 'labor') {
            currentAhs.labor.push({
              type: name,
              code: itemCode || `L-${currentAhs.labor.length + 1}`,
              unit: itemUnit || 'OH',
              coefficient: coeff,
              rate: rate || 0,
              cost: cost || (coeff * rate)
            });
          } else if (currentSection === 'material') {
            currentAhs.materials.push({
              name,
              code: itemCode || `M-${currentAhs.materials.length + 1}`,
              unit: itemUnit || 'Kg',
              coefficient: coeff,
              rate: rate || 0,
              cost: cost || (coeff * rate)
            });
          } else if (currentSection === 'equipment') {
            currentAhs.equipment.push({
              name,
              code: itemCode || `E-${currentAhs.equipment.length + 1}`,
              unit: itemUnit || 'Sewa-Hari',
              coefficient: coeff,
              rate: rate || 0,
              cost: cost || (coeff * rate)
            });
          }
        }
      }
    }

    // Capture the last block if it wasn't closed
    if (currentAhs) {
      currentAhs.directCost = currentAhs.totalLabor + currentAhs.totalMaterial + currentAhs.totalEquipment;
      currentAhs.overheadCost = currentAhs.directCost * (currentAhs.overheadPercent / 100);
      currentAhs.unitPrice = currentAhs.directCost + currentAhs.overheadCost;
      data.ahsp.push(currentAhs);
    }
  }

  // 4. PARSE BOQ (RAB 36)
  const boqSheet = workbook.Sheets['RAB 36'] || workbook.Sheets['RAB'] || workbook.Sheets['BoQ'];
  if (boqSheet) {
    const rows = utils.sheet_to_json<any[]>(boqSheet, { header: 1 });
    let isData = false;
    for (const row of rows) {
      if (!row || row.length === 0) continue;
      const cells = row.map(cleanStr);
      const rowText = cells.join(' ');

      if (rowText.toLowerCase().includes('uraian pekerjaan') && rowText.toLowerCase().includes('volume')) {
        isData = true;
        continue;
      }

      if (isData) {
        const no = cells[0];
        const description = cells[1];
        
        // Some columns might be slightly shifted
        // In the dump: index 4 is Volume 1 Unit, index 5 is Volume, index 6 is Satuan, index 7 or 8 is Harga Satuan, index 9 is Jumlah Harga
        let vol = parseFloatVal(row[5]);
        let sat = cleanStr(row[6]);
        let price = parseFloatVal(row[7] || row[8]);
        let total = parseFloatVal(row[9]);

        if (!sat && cleanStr(row[5])) {
          // Try shifts
          vol = parseFloatVal(row[4]);
          sat = cleanStr(row[5]);
          price = parseFloatVal(row[6]);
          total = parseFloatVal(row[7]);
        }

        if (description) {
          // Check if it's a heading, e.g. "PEKERJAAN PENDAHULUAN" or Roman numerals "I", "II" with no volume
          const isHeader = (!vol && !price) || (no && /^[IVXLCDM]+$/.test(no));
          
          if (isHeader) {
            data.boq.push({
              no,
              description,
              unit: '',
              volume: 0,
              unitPrice: 0,
              totalPrice: 0,
              isHeader: true
            });
          } else {
            // Find AHS Code matching the description to link it
            // We can match by finding an AHS block whose title contains this description, or vice-versa
            const matchedAhs = data.ahsp.find(a => 
              a.name.toLowerCase().includes(description.toLowerCase()) || 
              description.toLowerCase().includes(a.name.toLowerCase())
            );

            // Compute total if zero or inaccurate
            const calculatedTotal = vol * price;

            data.boq.push({
              no,
              description,
              unit: sat,
              volume: vol,
              unitPrice: price,
              totalPrice: calculatedTotal || total,
              isHeader: false,
              ahsCode: matchedAhs ? matchedAhs.code : undefined
            });
          }
        }
      }
    }
  }

  // 5. PARSE REKAP (REKAP TAHAP 3)
  const rekapSheet = workbook.Sheets['REKAP TAHAP 3'] || workbook.Sheets['REKAP'] || workbook.Sheets['Rekapitulasi'];
  if (rekapSheet) {
    const rows = utils.sheet_to_json<any[]>(rekapSheet, { header: 1 });
    let isData = false;
    for (const row of rows) {
      if (!row || row.length === 0) continue;
      const cells = row.map(cleanStr);
      const rowText = cells.join(' ');
      if (rowText.toLowerCase().includes('uraian pekerjaan') || rowText.toLowerCase().includes('jumlah harga')) {
        isData = true;
        continue;
      }
      if (isData) {
        const no = cells[0];
        const description = cells[1];
        const totalPrice = parseFloatVal(row[2] || row[3] || row[4]);
        
        if (description && (no || totalPrice > 0) && !description.toLowerCase().includes('terbilang') && !description.toLowerCase().includes('total')) {
          data.rekap.push({ no, description, totalPrice });
        }
      }
    }
  }

  // 6. PARSE SMKK (K3 Gedung)
  const smkkSheet = workbook.Sheets['K3 Gedung'] || workbook.Sheets['SMKK'];
  if (smkkSheet) {
    const rows = utils.sheet_to_json<any[]>(smkkSheet, { header: 1 });
    let isData = false;
    for (const row of rows) {
      if (!row || row.length === 0) continue;
      const cells = row.map(cleanStr);
      const rowText = cells.join(' ');

      if (rowText.toLowerCase().includes('uraian pekerjaan') && rowText.toLowerCase().includes('satuan')) {
        isData = true;
        continue;
      }

      if (isData) {
        const no = cells[0];
        const description = cells[1] || cells[2];
        const unit = cells[5] || cells[3];
        const vol = parseFloatVal(row[6] || row[4]);
        const price = parseFloatVal(row[7] || row[5]);
        const total = parseFloatVal(row[8] || row[6]);

        if (description && !description.toLowerCase().includes('sub total') && !description.toLowerCase().includes('total')) {
          const isHeader = !vol && !price;
          data.smkk.push({
            no,
            description,
            unit,
            volume: vol,
            unitPrice: price,
            totalPrice: total || (vol * price),
            isHeader
          });
        }
      }
    }
  }

  // Fallback data if parsing failed (in case it is an empty Excel file)
  if (data.boq.length === 0) {
    data.projectName = 'PERENCANAAN PEMBANGUNAN 1 UNIT TOILET';
    data.location = 'KOTA SORONG';
    data.year = '2026';
    // Add mock elements just to be safe
    data.labor = [
      { code: 'L.01', name: 'Pekerja', unit: 'OH', rate: 184000 },
      { code: 'L.02', name: 'Tukang Kayu', unit: 'OH', rate: 241500 },
      { code: 'L.03', name: 'Tukang Batu', unit: 'OH', rate: 241500 },
      { code: 'L.04', name: 'Mandor', unit: 'OH', rate: 287500 }
    ];
    data.materials = [
      { code: 'M.01', name: 'Semen Portland (PC)', unit: 'Sak', rate: 75000 },
      { code: 'M.02', name: 'Pasir Beton', unit: 'M3', rate: 500000 },
      { code: 'M.03', name: 'Batu Belah 15-20cm', unit: 'M3', rate: 450000 },
      { code: 'M.04', name: 'Kayu Kaso 5x7cm Kelas II', unit: 'M3', rate: 3805800 }
    ];
  }

  return data;
};

// Re-calculate the entire RAB when Basic Prices change
export const recalculateRab = (data: RabData): RabData => {
  const updatedAhsp = data.ahsp.map(ahs => {
    // 1. Update Labor rates
    const updatedLabor = ahs.labor.map(lab => {
      const matchingHsd = data.labor.find(l => l.name === lab.type || l.code === lab.code);
      const newRate = matchingHsd ? matchingHsd.rate : lab.rate;
      return {
        ...lab,
        rate: newRate,
        cost: lab.coefficient * newRate
      };
    });

    // 2. Update Material rates
    const updatedMaterials = ahs.materials.map(mat => {
      const matchingHsd = data.materials.find(m => m.name === mat.name || m.code === mat.code);
      const newRate = matchingHsd ? matchingHsd.rate : mat.rate;
      return {
        ...mat,
        rate: newRate,
        cost: mat.coefficient * newRate
      };
    });

    // 3. Equipment (assuming unchanged for now)
    const updatedEquipment = ahs.equipment.map(eq => ({ ...eq }));

    // 4. Summarize Section Totals
    const totalLabor = updatedLabor.reduce((acc, l) => acc + l.cost, 0);
    const totalMaterial = updatedMaterials.reduce((acc, m) => acc + m.cost, 0);
    const totalEquipment = updatedEquipment.reduce((acc, e) => acc + e.cost, 0);
    const directCost = totalLabor + totalMaterial + totalEquipment;
    const overheadCost = directCost * (ahs.overheadPercent / 100);
    const unitPrice = directCost + overheadCost;

    return {
      ...ahs,
      labor: updatedLabor,
      materials: updatedMaterials,
      equipment: updatedEquipment,
      totalLabor,
      totalMaterial,
      totalEquipment,
      directCost,
      overheadCost,
      unitPrice
    };
  });

  // 5. Update BoQ Unit Prices and Totals
  const updatedBoq = data.boq.map(item => {
    if (item.isHeader) return { ...item };
    
    // Find matching AHS code
    const matchingAhs = updatedAhsp.find(ahs => ahs.code === item.ahsCode || ahs.name.toLowerCase() === item.description.toLowerCase());
    const newUnitPrice = matchingAhs ? matchingAhs.unitPrice : item.unitPrice;
    
    return {
      ...item,
      unitPrice: newUnitPrice,
      totalPrice: item.volume * newUnitPrice
    };
  });

  // 6. Update Rekap totals based on division summaries in BoQ
  // We match division headers in BoQ to compute division totals
  const updatedRekap = data.rekap.map(rekapItem => {
    // Find items in BoQ under this division
    // A division starts with a header, and ends at the next header or end of BoQ
    const boqHeaderIndex = updatedBoq.findIndex(b => b.isHeader && b.description.toLowerCase().includes(rekapItem.description.toLowerCase()));
    
    if (boqHeaderIndex !== -1) {
      let sum = 0;
      for (let i = boqHeaderIndex + 1; i < updatedBoq.length; i++) {
        if (updatedBoq[i].isHeader) break; // Reached next division
        sum += updatedBoq[i].totalPrice;
      }
      return {
        ...rekapItem,
        totalPrice: sum
      };
    }
    return { ...rekapItem };
  });

  return {
    ...data,
    ahsp: updatedAhsp,
    boq: updatedBoq,
    rekap: updatedRekap
  };
};
