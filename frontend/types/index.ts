export interface Dataset {
  id: string;
  filename: string;
  file_url: string;
  row_count: number;
  created_at: string;
}

export interface ColumnSummary {
  column: string;
  dtype: string;
  count: number;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  mean?: number | null;
  std?: number | null;
  min?: number | null;
  median?: number | null;
  max?: number | null;
  top_values?: { value: string; count: number }[] | null;
}

export interface SummaryStats {
  row_count: number;
  column_count: number;
  columns: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  column_summaries: Record<string, ColumnSummary>;
  correlations?: Record<string, Record<string, number>>;
  preview_data?: Record<string, any>[];
}

export interface AnalysisResult {
  id: string;
  dataset_id: string;
  summary_stats: SummaryStats;
  created_at: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  environment: string;
  timestamp: string;
}

export interface UploadDatasetResponse {
  message: string;
  dataset: Dataset;
  analysis: AnalysisResult;
}

export interface DatasetDetailResponse {
  dataset: Dataset;
  analysis: AnalysisResult | null;
}
