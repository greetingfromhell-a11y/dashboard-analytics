-- ==============================================================================
-- Real-Time Collaborative Dashboard & Analytics - Database Schema & Policies
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Table: datasets
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    row_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for ordering datasets by recency
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON public.datasets(created_at DESC);

-- 2. Table: analysis_results
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    summary_stats JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for foreign key lookup
CREATE INDEX IF NOT EXISTS idx_analysis_results_dataset_id ON public.analysis_results(dataset_id);

-- 3. Enable Row Level Security (RLS) on tables
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing policies
DROP POLICY IF EXISTS "Allow public read on datasets" ON public.datasets;
DROP POLICY IF EXISTS "Allow public insert on datasets" ON public.datasets;
DROP POLICY IF EXISTS "Allow public read on analysis_results" ON public.analysis_results;
DROP POLICY IF EXISTS "Allow public insert on analysis_results" ON public.analysis_results;

-- 5. Create Table RLS Policies
CREATE POLICY "Allow public read on datasets"
    ON public.datasets FOR SELECT USING (true);

CREATE POLICY "Allow public insert on datasets"
    ON public.datasets FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on analysis_results"
    ON public.analysis_results FOR SELECT USING (true);

CREATE POLICY "Allow public insert on analysis_results"
    ON public.analysis_results FOR INSERT WITH CHECK (true);

-- 6. Storage Bucket Upload & Read Policies for 'datasets' bucket
DROP POLICY IF EXISTS "Allow public uploads to datasets bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from datasets bucket" ON storage.objects;

CREATE POLICY "Allow public uploads to datasets bucket"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'datasets');

CREATE POLICY "Allow public read from datasets bucket"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'datasets');
