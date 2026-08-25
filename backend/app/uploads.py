"""Configuración de almacenamiento de archivos subidos (imágenes de productos)."""

from pathlib import Path

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Rutas públicas (montadas en main.py)
UPLOADS_URL_PREFIX = "/api/uploads/files"

MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB

CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
