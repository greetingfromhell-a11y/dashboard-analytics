"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
  Database,
} from "lucide-react";
import { uploadDataset } from "@/lib/api";
import type { UploadDatasetResponse } from "@/types";

interface FileUploaderProps {
  onUploadSuccess: (data: UploadDatasetResponse) => void;
  onLoadDemo?: () => void;
}

const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];
const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB

export default function FileUploader({ onUploadSuccess, onLoadDemo }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusState, setStatusState] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validateFile = (file: File): string | null => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `Invalid format '${extension}'. Please upload a CSV or Excel file (.csv, .xlsx, .xls).`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File exceeds 150 MB maximum allowed size (${formatFileSize(file.size)}).`;
    }
    if (file.size === 0) {
      return "The selected file is empty.";
    }
    return null;
  };

  const handleFileSelection = (file: File) => {
    setErrorMessage(null);
    setStatusState("idle");
    setUploadProgress(0);

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setStatusState("idle");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setStatusState("uploading");
      setUploadProgress(0);
      setErrorMessage(null);

      const result = await uploadDataset(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
          if (percent >= 100) {
            setStatusState("processing");
          }
        }
      });

      setStatusState("success");
      onUploadSuccess(result);
    } catch (err: any) {
      setStatusState("error");
      const message =
        err.response?.data?.detail ||
        err.message ||
        "An unexpected error occurred while uploading.";
      setErrorMessage(message);
    }
  };

  const handleLoadSampleSales = async () => {
    try {
      setStatusState("uploading");
      setUploadProgress(20);

      // Fetch sample CSV bundled in app
      const sampleCsv = `date,region,product,sales_amount,units_sold,discount,profit
2024-01-05,North,Laptops,12500.50,10,0.05,2100.25
2024-01-08,West,Smartphones,8900.00,15,0.10,1450.00
2024-01-12,East,Monitors,4200.75,18,0.00,890.50
2024-01-15,South,Accessories,1850.20,35,0.15,420.10
2024-01-20,North,Tablets,6200.00,12,0.05,980.00
2024-01-25,East,Laptops,15400.00,12,0.08,2650.00
2024-02-02,West,Monitors,5100.00,20,0.05,1020.00
2024-02-05,South,Smartphones,11200.00,18,0.12,1850.00
2024-02-10,North,Accessories,2400.50,42,0.10,560.20
2024-02-14,East,Tablets,7800.00,14,0.00,1320.00
2024-02-18,West,Laptops,18200.00,14,0.05,3100.00
2024-02-22,South,Monitors,3900.00,15,0.05,740.00
2024-02-28,North,Smartphones,14100.00,22,0.10,2300.00
2024-03-03,East,Accessories,3100.00,50,0.15,690.00
2024-03-07,West,Tablets,9400.00,16,0.08,1580.00
2024-03-12,South,Laptops,13900.00,11,0.05,2400.00
2024-03-16,North,Monitors,6300.00,24,0.00,1350.00
2024-03-20,East,Smartphones,16800.00,26,0.10,2850.00
2024-03-25,West,Accessories,2750.00,45,0.05,620.00
2024-03-30,South,Tablets,8500.00,15,0.05,1410.00`;

      const blob = new Blob([sampleCsv], { type: "text/csv" });
      const sampleFile = new File([blob], "demo_sales_dataset.csv", { type: "text/csv" });
      setSelectedFile(sampleFile);
      setUploadProgress(60);
      setStatusState("processing");

      const result = await uploadDataset(sampleFile);
      setUploadProgress(100);
      setStatusState("success");
      onUploadSuccess(result);
    } catch (err: any) {
      setStatusState("error");
      setErrorMessage(err.message || "Failed to load sample dataset");
    }
  };

  return (
    <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
      {/* Subtle Corner Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white">Ingest Dataset</h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Up to 150 MB
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Accepts CSV and Excel (.xlsx, .xls) files. Automatically extracts metrics & correlations.
          </p>
        </div>

        {/* 1-Click Demo Button */}
        <button
          onClick={handleLoadSampleSales}
          disabled={statusState === "uploading" || statusState === "processing"}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 shadow-sm transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Load Demo Dataset</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-[1.01]"
            : "border-slate-800 hover:border-slate-600 bg-slate-950/50 hover:bg-slate-950/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3.5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 ${
              isDragging
                ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white scale-110 shadow-lg shadow-blue-500/30"
                : "bg-slate-800/80 text-blue-400 border border-slate-700"
            }`}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              <span className="text-blue-400 hover:underline">Choose a file</span> or drag & drop here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports CSV, XLSX, and XLS &bull; Max 150 MB
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Card */}
      {selectedFile && (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs sm:text-sm font-semibold text-white truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-slate-400">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>

          {statusState === "idle" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {(statusState === "uploading" || statusState === "processing") && (
        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              {statusState === "uploading"
                ? `Uploading (${uploadProgress}%)`
                : "Computing Pandas statistics & distributions..."}
            </span>
            <span className="font-mono">{uploadProgress}%</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-rose-200">Error: </span>
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {statusState === "success" && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="flex-1 font-medium">
            Dataset processed and saved to Supabase successfully!
          </div>
        </div>
      )}

      {/* Action Upload Button */}
      {selectedFile && statusState !== "success" && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleUpload}
            disabled={statusState === "uploading" || statusState === "processing"}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 active:scale-95"
          >
            {statusState === "uploading" || statusState === "processing" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Analyze Dataset
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
