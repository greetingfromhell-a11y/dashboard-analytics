from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ColumnSummary(BaseModel):
    """Statistical summary for an individual column."""

    column: str
    dtype: str
    count: int
    missing_count: int
    missing_percentage: float
    unique_count: int
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    q25: Optional[float] = None
    median: Optional[float] = None
    q75: Optional[float] = None
    max: Optional[float] = None
    top_values: Optional[List[Dict[str, Any]]] = None


class SummaryStats(BaseModel):
    """Aggregate statistical results of the processed dataset."""

    row_count: int
    column_count: int
    columns: List[str]
    numeric_columns: List[str]
    categorical_columns: List[str]
    column_summaries: Dict[str, ColumnSummary]
    correlations: Optional[Dict[str, Dict[str, Optional[float]]]] = Field(
        default=None,
        description="Correlation matrix between numeric columns",
    )
    preview_data: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="First 10 sample rows for frontend table preview",
    )


class DatasetResponse(BaseModel):
    """Metadata representation of an uploaded dataset."""

    id: str
    filename: str
    file_url: str
    row_count: int
    created_at: str


class AnalysisResultResponse(BaseModel):
    """Analysis result record linked to a dataset."""

    id: str
    dataset_id: str
    summary_stats: Dict[str, Any]
    created_at: str


class DatasetDetailResponse(BaseModel):
    """Detailed dataset view including computed analysis."""

    dataset: DatasetResponse
    analysis: Optional[AnalysisResultResponse] = None


class UploadDatasetResponse(BaseModel):
    """API response after processing and storing an uploaded file."""

    message: str
    dataset: DatasetResponse
    analysis: AnalysisResultResponse
