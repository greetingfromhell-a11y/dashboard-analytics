import os
import uuid
import re
from typing import Any, Dict, List, Optional
from supabase import create_client, Client
from app.core.config import Settings, settings


class SupabaseService:
    """Service to interact with Supabase Database and Storage."""

    _client: Optional[Client] = None
    _cached_key: Optional[str] = None

    @classmethod
    def get_client(cls) -> Client:
        """Get or initialize the Supabase client."""
        # Reload settings in case .env was modified
        current_settings = Settings()
        url = current_settings.SUPABASE_URL
        key = current_settings.SUPABASE_KEY

        # Validate presence and non-placeholder credentials
        if not url or not key or "your-project" in url or "your-anon" in key:
            raise ValueError(
                "Supabase is not properly configured. "
                "Please update SUPABASE_URL and SUPABASE_KEY in your backend/.env file."
            )

        if cls._client is not None and cls._cached_key == key:
            return cls._client

        cls._client = create_client(url, key)
        cls._cached_key = key
        return cls._client

    @classmethod
    def is_configured(cls) -> bool:
        """Check if Supabase credentials are configured."""
        current_settings = Settings()
        url = current_settings.SUPABASE_URL
        key = current_settings.SUPABASE_KEY
        return bool(url and key and "your-project" not in url and "your-anon" not in key)

    @classmethod
    def upload_file_to_storage(
        cls,
        file_bytes: bytes,
        filename: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """Upload raw dataset file to Supabase 'datasets' storage bucket and return the public URL."""
        client = cls.get_client()
        bucket_name = "datasets"

        # Sanitize filename and create unique storage path
        clean_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", filename)
        storage_path = f"{uuid.uuid4()}_{clean_name}"

        try:
            client.storage.from_(bucket_name).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "false"},
            )
        except Exception as e:
            # If upload fails, check if bucket exists or raise error
            raise RuntimeError(f"Failed to upload file to Supabase storage '{bucket_name}': {str(e)}")

        # Retrieve public URL for the file
        public_url = client.storage.from_(bucket_name).get_public_url(storage_path)
        return public_url

    @classmethod
    def create_dataset_record(
        cls,
        filename: str,
        file_url: str,
        row_count: int,
    ) -> Dict[str, Any]:
        """Insert a new dataset metadata record into the 'datasets' table."""
        client = cls.get_client()

        data = {
            "filename": filename,
            "file_url": file_url,
            "row_count": row_count,
        }

        response = client.table("datasets").insert(data).execute()

        if not response.data:
            raise RuntimeError("Failed to insert record into 'datasets' table.")

        return response.data[0]

    @classmethod
    def create_analysis_record(
        cls,
        dataset_id: str,
        summary_stats: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Insert computed summary statistics into the 'analysis_results' table."""
        client = cls.get_client()

        data = {
            "dataset_id": dataset_id,
            "summary_stats": summary_stats,
        }

        response = client.table("analysis_results").insert(data).execute()

        if not response.data:
            raise RuntimeError("Failed to insert record into 'analysis_results' table.")

        return response.data[0]

    @classmethod
    def get_all_datasets(cls, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve all datasets ordered by creation date descending."""
        client = cls.get_client()
        response = (
            client.table("datasets")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data or []

    @classmethod
    def get_dataset_by_id(cls, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve dataset metadata along with associated analysis results."""
        client = cls.get_client()

        dataset_res = (
            client.table("datasets")
            .select("*")
            .eq("id", dataset_id)
            .limit(1)
            .execute()
        )

        if not dataset_res.data:
            return None

        dataset = dataset_res.data[0]

        analysis_res = (
            client.table("analysis_results")
            .select("*")
            .eq("dataset_id", dataset_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        analysis = analysis_res.data[0] if analysis_res.data else None

        return {
            "dataset": dataset,
            "analysis": analysis,
        }
