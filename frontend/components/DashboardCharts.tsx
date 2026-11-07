"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ZAxis,
} from "recharts";
import {
  BarChart3,
  LineChart as LineIcon,
  ScatterChart as ScatterIcon,
  Grid,
  Filter,
  Maximize2,
  TrendingUp,
} from "lucide-react";
import type { SummaryStats } from "@/types";

interface DashboardChartsProps {
  summaryStats: SummaryStats;
}

const PALETTE = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
];

export default function DashboardCharts({ summaryStats }: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"bar" | "line" | "scatter" | "correlation">("bar");

  const {
    numeric_columns,
    categorical_columns,
    columns,
    preview_data = [],
    correlations = {},
    column_summaries = {},
  } = summaryStats;

  // Chart configuration state
  const [selectedX, setSelectedX] = useState<string>("");
  const [selectedY, setSelectedY] = useState<string>("");
  const [scatterX, setScatterX] = useState<string>("");
  const [scatterY, setScatterY] = useState<string>("");
  const [aggregation, setAggregation] = useState<"sum" | "avg" | "count">("sum");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set smart initial defaults when columns change
  useEffect(() => {
    if (categorical_columns.length > 0) {
      setSelectedX(categorical_columns[0]);
    } else if (columns.length > 0) {
      setSelectedX(columns[0]);
    }

    if (numeric_columns.length > 0) {
      setSelectedY(numeric_columns[0]);
      setScatterX(numeric_columns[0]);
      setScatterY(numeric_columns.length > 1 ? numeric_columns[1] : numeric_columns[0]);
    }
  }, [summaryStats]);

  // Aggregate data for Bar and Line charts
  const aggregatedData = useMemo(() => {
    if (!selectedX || !preview_data.length) return [];

    // If Y is numeric, aggregate values grouped by X
    if (selectedY && numeric_columns.includes(selectedY)) {
      const groups: Record<string, { total: number; count: number }> = {};

      preview_data.forEach((row) => {
        const rawX = row[selectedX];
        const rawY = parseFloat(row[selectedY]);
        const key = rawX !== null && rawX !== undefined ? String(rawX) : "Unknown";

        if (!groups[key]) {
          groups[key] = { total: 0, count: 0 };
        }

        if (!isNaN(rawY)) {
          groups[key].total += rawY;
          groups[key].count += 1;
        }
      });

      return Object.entries(groups).map(([name, data]) => {
        let value = 0;
        if (aggregation === "sum") {
          value = Math.round(data.total * 100) / 100;
        } else if (aggregation === "avg") {
          value = data.count > 0 ? Math.round((data.total / data.count) * 100) / 100 : 0;
        } else {
          value = data.count;
        }
        return { name, value, count: data.count };
      });
    }

    // Fallback: frequency count of X
    const counts: Record<string, number> = {};
    preview_data.forEach((row) => {
      const rawX = row[selectedX];
      const key = rawX !== null && rawX !== undefined ? String(rawX) : "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [preview_data, selectedX, selectedY, aggregation, numeric_columns]);

  // Prepared data for Scatter plot
  const scatterData = useMemo(() => {
    if (!scatterX || !scatterY || !preview_data.length) return [];

    return preview_data
      .map((row) => {
        const xVal = parseFloat(row[scatterX]);
        const yVal = parseFloat(row[scatterY]);
        if (isNaN(xVal) || isNaN(yVal)) return null;
        return {
          x: xVal,
          y: yVal,
          label: row[selectedX] || `Sample`,
        };
      })
      .filter(Boolean);
  }, [preview_data, scatterX, scatterY, selectedX]);

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1">
          <p className="font-semibold text-white">{label || payload[0]?.payload?.label || ""}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color || "#60a5fa" }}>
              <span className="text-slate-400">{item.name}: </span>
              <span className="font-mono font-medium">{item.value?.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!isMounted) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
        Initializing interactive visualization suite...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header and Chart Type Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
            Phase 4 Visualizations
          </span>
          <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Interactive Dashboard & Charts
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("bar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === "bar"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Bar Chart
          </button>

          <button
            onClick={() => setActiveTab("line")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === "line"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            Line Chart
          </button>

          <button
            onClick={() => setActiveTab("scatter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === "scatter"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ScatterIcon className="w-3.5 h-3.5" />
            Scatter Plot
          </button>

          {Object.keys(correlations).length > 0 && (
            <button
              onClick={() => setActiveTab("correlation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === "correlation"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Correlation Matrix
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Controls Bar */}
      {activeTab !== "correlation" && (
        <div className="flex flex-wrap items-center gap-3.5 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-slate-300">Axis Config:</span>
          </div>

          {activeTab === "scatter" ? (
            <>
              {/* Scatter X Selection */}
              <div className="flex items-center gap-1.5">
                <label className="text-slate-400">X Metric:</label>
                <select
                  value={scatterX}
                  onChange={(e) => setScatterX(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 font-mono"
                >
                  {numeric_columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scatter Y Selection */}
              <div className="flex items-center gap-1.5">
                <label className="text-slate-400">Y Metric:</label>
                <select
                  value={scatterY}
                  onChange={(e) => setScatterY(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 font-mono"
                >
                  {numeric_columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* X Category Selection */}
              <div className="flex items-center gap-1.5">
                <label className="text-slate-400">Dimension (X):</label>
                <select
                  value={selectedX}
                  onChange={(e) => setSelectedX(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 font-mono"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Y Metric Selection */}
              {numeric_columns.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <label className="text-slate-400">Metric (Y):</label>
                  <select
                    value={selectedY}
                    onChange={(e) => setSelectedY(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {numeric_columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Aggregation Mode */}
              <div className="flex items-center gap-1.5">
                <label className="text-slate-400">Aggregation:</label>
                <select
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 uppercase font-mono text-[11px]"
                >
                  <option value="sum">Sum</option>
                  <option value="avg">Average</option>
                  <option value="count">Count</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chart Canvas Container */}
      <div className="h-[380px] w-full pt-2">
        {/* 1. Bar Chart */}
        {activeTab === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregatedData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
              <Bar
                name={`${aggregation.toUpperCase()} of ${selectedY || selectedX}`}
                dataKey="value"
                radius={[6, 6, 0, 0]}
              >
                {aggregatedData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PALETTE[index % PALETTE.length]}
                    className="hover:opacity-80 transition"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 2. Line Chart */}
        {activeTab === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aggregatedData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="value"
                name={`${aggregation.toUpperCase()} of ${selectedY || selectedX}`}
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#60a5fa", strokeWidth: 2, stroke: "#1e3a8a" }}
                activeDot={{ r: 6, fill: "#93c5fd" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* 3. Scatter Plot */}
        {activeTab === "scatter" && (
          numeric_columns.length < 2 ? (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 space-y-1">
              <ScatterIcon className="w-8 h-8 text-slate-700" />
              <p>Scatter plot requires at least 2 numerical features in your dataset.</p>
            </div>
          ) : scatterData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 space-y-1">
              <ScatterIcon className="w-8 h-8 text-slate-700" />
              <p>No valid numerical pairs found to plot for {scatterX} and {scatterY}.</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis
                type="number"
                dataKey="x"
                name={scatterX}
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                label={{ value: scatterX, position: "insideBottom", offset: -15, fill: "#94a3b8" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={scatterY}
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                label={{ value: scatterY, angle: -90, position: "insideLeft", offset: 5, fill: "#94a3b8" }}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-semibold text-white">{data.label}</p>
                        <p className="text-blue-400">
                          {scatterX}: <span className="font-mono font-medium">{data.x?.toLocaleString()}</span>
                        </p>
                        <p className="text-emerald-400">
                          {scatterY}: <span className="font-mono font-medium">{data.y?.toLocaleString()}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Distribution" data={scatterData} fill="#8b5cf6" opacity={0.85} />
            </ScatterChart>
          </ResponsiveContainer>
          )
        )}

        {/* 4. Correlation Heatmap */}
        {activeTab === "correlation" && (
          <div className="h-full overflow-auto p-4 flex flex-col items-center justify-center">
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70 shadow-lg">
              <table className="text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-800/80">
                    <th className="p-3 text-left font-semibold text-slate-300 border-b border-r border-slate-800">
                      Feature
                    </th>
                    {numeric_columns.map((col) => (
                      <th
                        key={col}
                        className="p-3 font-semibold text-slate-300 border-b border-r border-slate-800 last:border-r-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {numeric_columns.map((rowCol) => (
                    <tr key={rowCol} className="border-b border-slate-800 last:border-b-0">
                      <td className="p-3 text-left font-semibold text-white bg-slate-900/80 border-r border-slate-800">
                        {rowCol}
                      </td>
                      {numeric_columns.map((colCol) => {
                        const val = correlations[rowCol]?.[colCol];
                        const isSelf = rowCol === colCol;

                        // Color intensity based on correlation coefficient (-1 to 1)
                        let bgColor = "bg-slate-900/40";
                        let textColor = "text-slate-300";

                        if (val !== undefined && val !== null) {
                          if (val > 0.7) {
                            bgColor = "bg-emerald-500/30";
                            textColor = "text-emerald-300 font-bold";
                          } else if (val > 0.3) {
                            bgColor = "bg-emerald-500/15";
                            textColor = "text-emerald-400";
                          } else if (val < -0.7) {
                            bgColor = "bg-rose-500/30";
                            textColor = "text-rose-300 font-bold";
                          } else if (val < -0.3) {
                            bgColor = "bg-rose-500/15";
                            textColor = "text-rose-400";
                          }
                        }

                        return (
                          <td
                            key={colCol}
                            className={`p-3 font-mono border-r border-slate-800 last:border-r-0 transition ${bgColor} ${textColor}`}
                          >
                            {val !== undefined && val !== null ? val.toFixed(2) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 text-center">
              Pearson correlation coefficient matrix: <span className="text-emerald-400 font-semibold">+1.0</span> (positive relationship) to <span className="text-rose-400 font-semibold">-1.0</span> (negative relationship).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
