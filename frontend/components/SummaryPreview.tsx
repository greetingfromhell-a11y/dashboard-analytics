"use client";

import React, { useState } from "react";
import {
  BarChart,
  Hash,
  Type,
  AlertTriangle,
  FileText,
  Table as TableIcon,
  Download,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Dataset, SummaryStats } from "@/types";

interface SummaryPreviewProps {
  dataset: Dataset;
  summaryStats: SummaryStats;
}

export default function SummaryPreview({ dataset, summaryStats }: SummaryPreviewProps) {
  const [activeTab, setActiveTab] = useState<"columns" | "preview" | "health">("columns");

  const {
    row_count,
    column_count,
    numeric_columns,
    categorical_columns,
    column_summaries,
    preview_data = [],
  } = summaryStats;

  // Calculate overall missing statistics
  const totalCells = row_count * column_count;
  const totalMissing = Object.values(column_summaries).reduce(
    (acc, curr) => acc + (curr.missing_count || 0),
    0
  );
  const dataCompleteness = totalCells > 0 ? (((totalCells - totalMissing) / totalCells) * 100).toFixed(1) : "100";

  return (
    <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Corner Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Dataset Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
              Loaded Dataset
            </span>
            <span className="text-xs text-slate-400">
              {new Date(dataset.created_at).toLocaleDateString()}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="truncate max-w-md">{dataset.filename}</span>
          </h3>
        </div>

        {/* Download File Button */}
        {dataset.file_url.startsWith("http") ? (
          <a
            href={dataset.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download Raw File</span>
          </a>
        ) : (
          <span className="self-start sm:self-auto text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/80">
            Stored In-Memory (&gt;50MB)
          </span>
        )}
      </div>

      {/* Modern KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-950/60 border border-slate-800/90 p-4 rounded-xl shadow-inner">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Rows</p>
          <p className="text-2xl font-extrabold text-white mt-1 tracking-tight">
            {row_count.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Records ingested</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/90 p-4 rounded-xl shadow-inner">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Features</p>
          <p className="text-2xl font-extrabold text-white mt-1 tracking-tight">{column_count}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {numeric_columns.length} num &bull; {categorical_columns.length} cat
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/90 p-4 rounded-xl shadow-inner">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Data Completeness</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1 tracking-tight">
            {dataCompleteness}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {totalMissing.toLocaleString()} missing values
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/90 p-4 rounded-xl shadow-inner">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Numeric Correlations</p>
          <p className="text-2xl font-extrabold text-indigo-400 mt-1 tracking-tight">
            {numeric_columns.length >= 2 ? "Calculated" : "N/A"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {numeric_columns.length >= 2 ? "Pearson matrix available" : "Requires >= 2 numeric cols"}
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("columns")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === "columns"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          Column Profiles ({column_count})
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === "preview"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          Sample Table ({Math.min(10, preview_data.length)} rows)
        </button>
      </div>

      {/* Tab 1: Column Metrics Table */}
      {activeTab === "columns" && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Column Name</th>
                  <th className="py-3 px-3.5">Data Type</th>
                  <th className="py-3 px-3.5">Missing</th>
                  <th className="py-3 px-3.5">Unique</th>
                  <th className="py-3 px-3.5 text-right">Mean</th>
                  <th className="py-3 px-3.5 text-right">Std Dev</th>
                  <th className="py-3 px-3.5 text-right">Min</th>
                  <th className="py-3 px-3.5 text-right">Median</th>
                  <th className="py-3 px-3.5 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {Object.values(column_summaries).map((summary) => {
                  const isNumeric = summary.mean !== null && summary.mean !== undefined;
                  return (
                    <tr key={summary.column} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3.5 font-semibold text-white flex items-center gap-2">
                        {isNumeric ? (
                          <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                            <Hash className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                            <Type className="w-3 h-3" />
                          </span>
                        )}
                        <span className="font-mono">{summary.column}</span>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {summary.dtype}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        {summary.missing_count > 0 ? (
                          <span className="text-amber-400 font-medium flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            {summary.missing_count} ({summary.missing_percentage}%)
                          </span>
                        ) : (
                          <span className="text-emerald-400/80 text-[11px] flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> 0%
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 font-mono">{summary.unique_count.toLocaleString()}</td>

                      <td className="py-3 px-3.5 text-right font-mono text-slate-200">
                        {summary.mean !== null && summary.mean !== undefined
                          ? summary.mean.toLocaleString()
                          : "—"}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono text-slate-400">
                        {summary.std !== null && summary.std !== undefined
                          ? summary.std.toLocaleString()
                          : "—"}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                        {summary.min !== null && summary.min !== undefined
                          ? summary.min.toLocaleString()
                          : "—"}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono text-slate-200">
                        {summary.median !== null && summary.median !== undefined
                          ? summary.median.toLocaleString()
                          : "—"}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                        {summary.max !== null && summary.max !== undefined
                          ? summary.max.toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Sample Data Table */}
      {activeTab === "preview" && preview_data && preview_data.length > 0 && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  {Object.keys(preview_data[0]).map((colKey) => (
                    <th key={colKey} className="py-2.5 px-3.5 whitespace-nowrap">
                      {colKey}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {preview_data.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    {Object.keys(preview_data[0]).map((colKey) => (
                      <td key={colKey} className="py-2.5 px-3.5 whitespace-nowrap font-mono text-[11px]">
                        {row[colKey] !== null && row[colKey] !== undefined ? (
                          String(row[colKey])
                        ) : (
                          <span className="text-slate-600 italic">null</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
