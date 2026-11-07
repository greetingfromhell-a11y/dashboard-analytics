import axios, { AxiosProgressEvent } from "axios";
import type {
  Dataset,
  DatasetDetailResponse,
  HealthCheckResponse,
  UploadDatasetResponse,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 60000,
});

/**
 * Health check endpoint
 */
export async function getHealthStatus(): Promise<HealthCheckResponse> {
  const response = await apiClient.get<HealthCheckResponse>("/health");
  return response.data;
}

/**
 * Upload and process a CSV/Excel dataset
 */
export async function uploadDataset(
  file: File,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<UploadDatasetResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadDatasetResponse>("/datasets/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
}

/**
 * Retrieve list of all uploaded datasets
 */
export async function getDatasets(): Promise<Dataset[]> {
  const response = await apiClient.get<Dataset[]>("/datasets");
  return response.data;
}

/**
 * Retrieve a specific dataset and its analysis results
 */
export async function getDatasetById(datasetId: string): Promise<DatasetDetailResponse> {
  const response = await apiClient.get<DatasetDetailResponse>(`/datasets/${datasetId}`);
  return response.data;
}
