import io
import math
from typing import Any, Dict, List, Tuple
import numpy as np
import pandas as pd


class AnalyticsService:
    """Service to process tabular datasets using Pandas and compute statistical summaries."""

    @staticmethod
    def _sanitize_value(val: Any) -> Any:
        """Ensure values are JSON-serializable (replaces NaN, inf, NaT with None)."""
        if val is None:
            return None
        if isinstance(val, (float, np.floating)):
            if math.isnan(val) or math.isinf(val):
                return None
            return round(float(val), 4)
        if isinstance(val, (int, np.integer)):
            return int(val)
        if isinstance(val, (pd.Timestamp, np.datetime64)):
            try:
                return pd.to_datetime(val).isoformat()
            except Exception:
                return str(val)
        if pd.isna(val):
            return None
        return val

    @classmethod
    def read_dataframe(cls, file_bytes: bytes, filename: str) -> pd.DataFrame:
        """Read uploaded bytes into a pandas DataFrame based on file extension."""
        lower_name = filename.lower()
        bio = io.BytesIO(file_bytes)

        if lower_name.endswith(".csv"):
            try:
                df = pd.read_csv(bio, encoding="utf-8")
            except UnicodeDecodeError:
                bio.seek(0)
                try:
                    df = pd.read_csv(bio, encoding="latin-1")
                except Exception:
                    bio.seek(0)
                    df = pd.read_csv(bio, encoding="utf-8-sig")
        elif lower_name.endswith((".xlsx", ".xls")):
            df = pd.read_excel(bio)
        else:
            raise ValueError(f"Unsupported file format: {filename}. Supported formats are CSV and Excel (.xlsx, .xls).")

        # Normalize column names to strings
        df.columns = [str(c).strip() for c in df.columns]

        if df.empty:
            raise ValueError("The uploaded file contains no data rows.")

        return df

    @classmethod
    def compute_summary_statistics(cls, df: pd.DataFrame) -> Dict[str, Any]:
        """Compute statistical summaries, distributions, correlations, and sample data."""
        row_count = int(len(df))
        column_count = int(len(df.columns))
        columns = list(df.columns)

        # Separate numeric vs categorical columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = [col for col in columns if col not in numeric_cols]

        column_summaries: Dict[str, Dict[str, Any]] = {}

        # 1. Process Numeric Columns
        for col in numeric_cols:
            series = df[col]
            missing_count = int(series.isna().sum())
            valid_series = series.dropna()
            unique_count = int(series.nunique())

            mean_val = float(valid_series.mean()) if not valid_series.empty else None
            std_val = float(valid_series.std()) if len(valid_series) > 1 else None
            min_val = float(valid_series.min()) if not valid_series.empty else None
            q25_val = float(valid_series.quantile(0.25)) if not valid_series.empty else None
            median_val = float(valid_series.median()) if not valid_series.empty else None
            q75_val = float(valid_series.quantile(0.75)) if not valid_series.empty else None
            max_val = float(valid_series.max()) if not valid_series.empty else None

            column_summaries[col] = {
                "column": col,
                "dtype": str(series.dtype),
                "count": int(len(valid_series)),
                "missing_count": missing_count,
                "missing_percentage": round((missing_count / row_count) * 100, 2) if row_count > 0 else 0.0,
                "unique_count": unique_count,
                "mean": cls._sanitize_value(mean_val),
                "std": cls._sanitize_value(std_val),
                "min": cls._sanitize_value(min_val),
                "q25": cls._sanitize_value(q25_val),
                "median": cls._sanitize_value(median_val),
                "q75": cls._sanitize_value(q75_val),
                "max": cls._sanitize_value(max_val),
                "top_values": None,
            }

        # 2. Process Categorical/Text Columns
        for col in categorical_cols:
            series = df[col]
            missing_count = int(series.isna().sum())
            unique_count = int(series.nunique())
            valid_series = series.dropna()

            # Top 10 category frequencies
            top_freq = valid_series.value_counts().head(10).to_dict()
            top_values = [
                {"value": str(k), "count": int(v)}
                for k, v in top_freq.items()
            ]

            column_summaries[col] = {
                "column": col,
                "dtype": str(series.dtype),
                "count": int(len(valid_series)),
                "missing_count": missing_count,
                "missing_percentage": round((missing_count / row_count) * 100, 2) if row_count > 0 else 0.0,
                "unique_count": unique_count,
                "mean": None,
                "std": None,
                "min": None,
                "q25": None,
                "median": None,
                "q75": None,
                "max": None,
                "top_values": top_values,
            }

        # 3. Correlation Matrix (Numeric columns >= 2)
        correlations: Dict[str, Dict[str, Any]] = {}
        if len(numeric_cols) >= 2:
            try:
                corr_matrix = df[numeric_cols].corr(method="pearson")
                for col_a in numeric_cols:
                    correlations[col_a] = {}
                    for col_b in numeric_cols:
                        val = corr_matrix.loc[col_a, col_b]
                        correlations[col_a][col_b] = cls._sanitize_value(val)
            except Exception:
                correlations = {}

        # 4. Preview Sample (Up to 200 rows for charts & visualization, sanitized)
        preview_sample: List[Dict[str, Any]] = []
        sample_df = df.head(200)
        for _, row in sample_df.iterrows():
            sanitized_row = {
                str(col): cls._sanitize_value(row[col])
                for col in df.columns
            }
            preview_sample.append(sanitized_row)

        return {
            "row_count": row_count,
            "column_count": column_count,
            "columns": columns,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "column_summaries": column_summaries,
            "correlations": correlations,
            "preview_data": preview_sample,
        }

    @classmethod
    def process_file(cls, file_bytes: bytes, filename: str) -> Tuple[int, Dict[str, Any]]:
        """High-level method: parses file bytes, calculates statistics, and returns results."""
        df = cls.read_dataframe(file_bytes=file_bytes, filename=filename)
        summary_stats = cls.compute_summary_statistics(df)
        return summary_stats["row_count"], summary_stats
