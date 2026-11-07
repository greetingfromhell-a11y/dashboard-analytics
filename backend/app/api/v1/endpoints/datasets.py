from typing import List
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.models.dataset import (
    DatasetResponse,
    DatasetDetailResponse,
    UploadDatasetResponse,
    AnalysisResultResponse,
)
from app.services.analytics_service import AnalyticsService
from app.services.supabase_service import SupabaseService

router = APIRouter()

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}
MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024  # 150 MB


@router.post(
    "/upload",
    response_model=UploadDatasetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and process a dataset (CSV / Excel)",
    description=(
        "Uploads a tabular dataset, calculates comprehensive summary statistics "
        "via Pandas, and stores the raw file & analysis metadata in Supabase."
    ),
)
async def upload_dataset(file: UploadFile = File(...)):
    # 1. Validate file extension
    filename = file.filename or "dataset.csv"
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file format '{extension}'. "
                f"Please upload one of: {', '.join(ALLOWED_EXTENSIONS)}"
            ),
        )

    # 2. Read file content and validate size
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read file: {str(e)}",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    # 3. Process data using Pandas Analytics Service
    try:
        row_count, summary_stats = AnalyticsService.process_file(
            file_bytes=content,
            filename=filename,
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing dataset: {str(e)}",
        )

    # 4. Check Supabase credentials
    if not SupabaseService.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Supabase is not yet configured. Please set SUPABASE_URL and SUPABASE_KEY "
                "in your backend/.env file to store datasets and analysis results."
            ),
        )

    # 5. Upload raw file to Supabase Storage (Safe for Supabase Free Tier 50MB limit)
    content_type = file.content_type or "application/octet-stream"
    file_url = ""
    SUPABASE_STORAGE_LIMIT_BYTES = 48 * 1024 * 1024  # 48 MB limit on free plan

    if len(content) <= SUPABASE_STORAGE_LIMIT_BYTES:
        try:
            file_url = SupabaseService.upload_file_to_storage(
                file_bytes=content,
                filename=filename,
                content_type=content_type,
            )
        except Exception as e:
            error_msg = str(e)
            if "row-level security" in error_msg.lower() or "403" in error_msg or "unauthorized" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "Supabase Storage permission denied. Please copy your 'service_role' key from Supabase into backend/.env"
                    ),
                )
            file_url = f"https://supabase.com/storage/placeholder/{filename}"
    else:
        # File exceeds Supabase 50MB free-tier storage limit, but statistics are preserved
        file_url = f"file://oversized/{filename}"

    # 6. Save metadata to 'datasets' table
    try:
        dataset_record = SupabaseService.create_dataset_record(
            filename=filename,
            file_url=file_url,
            row_count=row_count,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error saving dataset metadata: {str(e)}",
        )

    # 7. Save calculated metrics to 'analysis_results' table
    try:
        analysis_record = SupabaseService.create_analysis_record(
            dataset_id=dataset_record["id"],
            summary_stats=summary_stats,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error saving analysis results: {str(e)}",
        )

    return UploadDatasetResponse(
        message="Dataset uploaded and analyzed successfully.",
        dataset=DatasetResponse(
            id=str(dataset_record["id"]),
            filename=dataset_record["filename"],
            file_url=dataset_record["file_url"],
            row_count=dataset_record["row_count"],
            created_at=str(dataset_record["created_at"]),
        ),
        analysis=AnalysisResultResponse(
            id=str(analysis_record["id"]),
            dataset_id=str(analysis_record["dataset_id"]),
            summary_stats=analysis_record["summary_stats"],
            created_at=str(analysis_record["created_at"]),
        ),
    )


@router.get(
    "",
    response_model=List[DatasetResponse],
    summary="List all uploaded datasets",
)
def list_datasets(limit: int = 50):
    if not SupabaseService.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase credentials are not configured in backend/.env.",
        )

    try:
        datasets = SupabaseService.get_all_datasets(limit=limit)
        return [
            DatasetResponse(
                id=str(d["id"]),
                filename=d["filename"],
                file_url=d["file_url"],
                row_count=d["row_count"],
                created_at=str(d["created_at"]),
            )
            for d in datasets
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch datasets: {str(e)}",
        )


@router.get(
    "/{dataset_id}",
    response_model=DatasetDetailResponse,
    summary="Get dataset details and computed analysis by ID",
)
def get_dataset(dataset_id: str):
    if not SupabaseService.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase credentials are not configured in backend/.env.",
        )

    try:
        data = SupabaseService.get_dataset_by_id(dataset_id)
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dataset with ID '{dataset_id}' not found.",
            )

        dataset = data["dataset"]
        analysis = data["analysis"]

        return DatasetDetailResponse(
            dataset=DatasetResponse(
                id=str(dataset["id"]),
                filename=dataset["filename"],
                file_url=dataset["file_url"],
                row_count=dataset["row_count"],
                created_at=str(dataset["created_at"]),
            ),
            analysis=AnalysisResultResponse(
                id=str(analysis["id"]),
                dataset_id=str(analysis["dataset_id"]),
                summary_stats=analysis["summary_stats"],
                created_at=str(analysis["created_at"]),
            )
            if analysis
            else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dataset details: {str(e)}",
        )
