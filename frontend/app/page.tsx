"use client";

import { useEffect, useState } from "react";
import { Server, CircleDashed, BarChart3, Database, Layers, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { getHealthStatus, getDatasets, getDatasetById } from "@/lib/api";
import FileUploader from "@/components/FileUploader";
import DatasetList from "@/components/DatasetList";
import SummaryPreview from "@/components/SummaryPreview";
import DashboardCharts from "@/components/DashboardCharts";
import type { Dataset, SummaryStats, HealthCheckResponse, UploadDatasetResponse } from "@/types";

export default function Home() {
  const [backendHealth, setBackendHealth] = useState<HealthCheckResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedSummaryStats, setSelectedSummaryStats] = useState<SummaryStats | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);

  // 1. Initial Health Check & Load Datasets
  useEffect(() => {
    async function initData() {
      try {
        setLoadingHealth(true);
        const health = await getHealthStatus();
        setBackendHealth(health);
        setHealthError(null);
      } catch (err: any) {
        setHealthError(err.message || "Unable to reach backend");
      } finally {
        setLoadingHealth(false);
      }

      await fetchDatasets();
    }

    initData();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoadingDatasets(true);
      const list = await getDatasets();
      setDatasets(list);

      // Auto-select latest dataset if none selected
      if (list.length > 0 && !selectedDataset) {
        loadDatasetDetails(list[0].id);
      }
    } catch {
      // Backend / Supabase initializing
    } finally {
      setLoadingDatasets(false);
    }
  };

  const loadDatasetDetails = async (datasetId: string) => {
    try {
      setLoadingAnalysis(true);
      const detail = await getDatasetById(datasetId);
      setSelectedDataset(detail.dataset);
      if (detail.analysis) {
        setSelectedSummaryStats(detail.analysis.summary_stats);
      }
    } catch (err) {
      console.error("Failed to load dataset details:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleUploadSuccess = (response: UploadDatasetResponse) => {
    setDatasets((prev) => [response.dataset, ...prev.filter((d) => d.id !== response.dataset.id)]);
    setSelectedDataset(response.dataset);
    setSelectedSummaryStats(response.analysis.summary_stats);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner with Modern SaaS Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Analytics & Visualization Engine</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight leading-tight">
              Instant Analytics from <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Any Tabular Dataset
              </span>
            </h2>

            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Drop any CSV or Excel file up to 150 MB. Pandas automatically parses features, handles missing values,
              computes descriptive statistics, and generates dynamic interactive charts.
            </p>
          </div>

          {/* Status Gateway Pill */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center space-x-4 flex-shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center">
              <Server className="w-6 h-6 text-indigo-400" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">FastAPI Core</p>
              <div className="flex items-center space-x-2 mt-1">
                {loadingHealth ? (
                  <span className="text-xs text-amber-400 flex items-center gap-1.5 font-medium">
                    <CircleDashed className="w-3.5 h-3.5 animate-spin" /> Connecting...
                  </span>
                ) : backendHealth ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    Online &bull; {backendHealth.service}
                  </span>
                ) : (
                  <span className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Offline ({healthError})
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">Port 8000 &bull; Supabase Connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Grid: Uploader (Left 2 cols) & History (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FileUploader onUploadSuccess={handleUploadSuccess} />
        </div>

        <div>
          <DatasetList
            datasets={datasets}
            selectedDatasetId={selectedDataset?.id}
            onSelectDataset={(d) => loadDatasetDetails(d.id)}
            isLoading={loadingDatasets}
          />
        </div>
      </div>

      {/* Visualizations & Data Analysis Section */}
      {loadingAnalysis ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-16 text-center text-slate-400 shadow-xl">
          <CircleDashed className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-400" />
          <p className="text-sm font-medium text-white">Crunching numbers with Pandas...</p>
          <p className="text-xs text-slate-500 mt-1">Calculating percentiles, correlations, and distributions</p>
        </div>
      ) : selectedDataset && selectedSummaryStats ? (
        <div className="space-y-6">
          <DashboardCharts summaryStats={selectedSummaryStats} />
          <SummaryPreview
            dataset={selectedDataset}
            summaryStats={selectedSummaryStats}
          />
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-4 text-blue-400">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-semibold text-slate-300">No active dataset selected</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            Upload your CSV/Excel file or click <span className="text-blue-400 font-semibold">Load Demo Dataset</span> above to immediately view interactive charts, correlations, and statistical summaries.
          </p>
        </div>
      )}
    </div>
  );
}
