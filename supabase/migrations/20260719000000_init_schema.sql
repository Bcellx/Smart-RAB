-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  year VARCHAR(50),
  weeks_count INT DEFAULT 10,
  schedules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create materials table (HSD Bahan)
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(100) NOT NULL,
  name TEXT NOT NULL,
  unit VARCHAR(50),
  rate NUMERIC DEFAULT 0 NOT NULL,
  rap_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create labor table (HSD Upah)
CREATE TABLE IF NOT EXISTS labor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(100) NOT NULL,
  name TEXT NOT NULL,
  unit VARCHAR(50),
  rate NUMERIC DEFAULT 0 NOT NULL,
  rap_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ahsp table (Analisa Harga Satuan Pekerjaan)
CREATE TABLE IF NOT EXISTS ahsp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(100) NOT NULL,
  name TEXT NOT NULL,
  unit VARCHAR(50),
  overhead_percent NUMERIC DEFAULT 15 NOT NULL,
  direct_cost NUMERIC DEFAULT 0 NOT NULL,
  overhead_cost NUMERIC DEFAULT 0 NOT NULL,
  unit_price NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ahsp_details table
CREATE TABLE IF NOT EXISTS ahsp_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ahsp_id UUID REFERENCES ahsp(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'labor', 'material', 'equipment'
  code VARCHAR(100),
  name TEXT NOT NULL,
  unit VARCHAR(50),
  coefficient NUMERIC DEFAULT 0 NOT NULL,
  rate NUMERIC DEFAULT 0 NOT NULL,
  cost NUMERIC DEFAULT 0 NOT NULL
);

-- Create boq table (Daftar Kuantitas & Harga)
CREATE TABLE IF NOT EXISTS boq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  no VARCHAR(50),
  description TEXT NOT NULL,
  unit VARCHAR(50),
  volume NUMERIC DEFAULT 0 NOT NULL,
  unit_price NUMERIC DEFAULT 0 NOT NULL,
  total_price NUMERIC DEFAULT 0 NOT NULL,
  is_header BOOLEAN DEFAULT false NOT NULL,
  ahs_code VARCHAR(100),
  rap_unit_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create smkk table (Biaya Penerapan K3 Gedung)
CREATE TABLE IF NOT EXISTS smkk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  no VARCHAR(50),
  description TEXT NOT NULL,
  unit VARCHAR(50),
  volume NUMERIC DEFAULT 0 NOT NULL,
  unit_price NUMERIC DEFAULT 0 NOT NULL,
  total_price NUMERIC DEFAULT 0 NOT NULL,
  is_header BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
