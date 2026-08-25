import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.deps import require_admin
from app.uploads import CONTENT_TYPE_EXTENSIONS, MAX_UPLOAD_SIZE, UPLOADS_DIR, UPLOADS_URL_PREFIX

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("")
async def subir_imagen(file: UploadFile, _admin=Depends(require_admin)):
    extension = CONTENT_TYPE_EXTENSIONS.get(file.content_type)
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Formato no permitido. Usá JPG, PNG, WEBP o GIF.",
        )

    contenido = await file.read()
    if len(contenido) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="La imagen no puede superar los 5 MB.",
        )
    if len(contenido) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Archivo vacío.")

    nombre_archivo = f"{uuid.uuid4().hex}{extension}"
    destino = UPLOADS_DIR / nombre_archivo
    destino.write_bytes(contenido)

    return {"url": f"{UPLOADS_URL_PREFIX}/{nombre_archivo}"}
