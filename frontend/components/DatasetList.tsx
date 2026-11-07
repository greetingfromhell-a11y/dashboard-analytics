"use client";

import React from "react";
import { FileSpreadsheet, Clock, Database, ChevronRight, Layers } from "lucide-react";
import type { Dataset } from "@/types";

interface DatasetListProps {
  datasets: Dataset[];
  selectedDatasetId?: string | null;
  onSelectDataset: (dataset: Dataset) => void;
  isLoading: boolean;
}

export default function DatasetList({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  isLoading,
}: DatasetListProps) {
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">Dataset History</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
          {datasets.length} {datasets.length === 1 ? "Dataset" : "Datasets"}
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
          Loading datasets from Supabase...
        </div>
      ) : datasets.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl p-6">
          <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No datasets uploaded yet.</p>
          <p className="text-xs text-slate-500 mt-1">
            Upload your first CSV or Excel file above to see analysis results.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {datasets.map((dataset) => {
            const isSelected = selectedDatasetId === dataset.id;
            return (
              <div
                key={dataset.id}
                onClick={() => onSelectDataset(dataset)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? "bg-blue-600/10 border-blue-500/50 text-white"
                    : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-white truncate">
                      {dataset.filename}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                      <span>{dataset.row_count.toLocaleString()} rows</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(dataset.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 flex-shrink-0 transition ${
                    isSelected ? "text-blue-400 translate-x-0.5" : "text-slate-500"
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
