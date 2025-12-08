"""Upload endpoints for handling file uploads."""

import os
import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_business_admin
from app.core.database import get_db
from app.models.business import Business

router = APIRouter(prefix="/upload", tags=["upload"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def validate_image(file: UploadFile) -> None:
    """Validate uploaded image file."""
    # Check file extension
    file_ext = Path(file.filename or "").suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to start

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB",
        )


@router.post("/photo")
async def upload_photo(
    file: Annotated[UploadFile, File(description="Image file to upload")],
    current_business: Annotated[Business, Depends(get_current_business_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    """
    Upload a photo file.

    Returns the URL path to the uploaded file.
    """
    # Validate file
    validate_image(file)

    # Generate unique filename
    file_ext = Path(file.filename or "").suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"

    # Create business-specific subdirectory
    business_upload_dir = UPLOAD_DIR / str(current_business.id)
    business_upload_dir.mkdir(exist_ok=True)

    # Save file
    file_path = business_upload_dir / unique_filename
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )

    # Return relative URL path
    url_path = f"/uploads/{current_business.id}/{unique_filename}"

    return {"url": url_path, "filename": unique_filename}


@router.delete("/photo")
async def delete_photo(
    url: str,
    current_business: Annotated[Business, Depends(get_current_business_admin)],
) -> dict[str, str]:
    """Delete a photo file."""
    # Extract filename from URL
    if not url.startswith(f"/uploads/{current_business.id}/"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this file",
        )

    # Build file path
    file_path = Path(url.lstrip("/"))

    # Check if file exists and delete
    if file_path.exists():
        try:
            os.remove(file_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete file: {str(e)}",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    return {"message": "Photo deleted successfully"}
