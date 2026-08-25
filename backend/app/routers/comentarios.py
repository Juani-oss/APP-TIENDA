from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models import Comentario, Producto
from app.schemas import ComentarioCreate, ComentarioOut

router = APIRouter(prefix="/api", tags=["comentarios"])


@router.get("/productos/{producto_id}/comentarios", response_model=list[ComentarioOut])
def listar_comentarios_producto(producto_id: int, db: Session = Depends(get_db)):
    if not db.get(Producto, producto_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return (
        db.query(Comentario)
        .filter(Comentario.producto_id == producto_id, Comentario.aprobado.is_(True))
        .order_by(Comentario.created_at.desc())
        .all()
    )


@router.post(
    "/productos/{producto_id}/comentarios",
    response_model=ComentarioOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_comentario(producto_id: int, payload: ComentarioCreate, db: Session = Depends(get_db)):
    if not db.get(Producto, producto_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    comentario = Comentario(producto_id=producto_id, aprobado=False, **payload.model_dump())
    db.add(comentario)
    db.commit()
    db.refresh(comentario)
    return comentario


@router.get("/comentarios", response_model=list[ComentarioOut])
def listar_comentarios(
    aprobado: bool | None = None,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    query = db.query(Comentario)
    if aprobado is not None:
        query = query.filter(Comentario.aprobado == aprobado)
    return query.order_by(Comentario.created_at.desc()).all()


@router.put("/comentarios/{comentario_id}/aprobar", response_model=ComentarioOut)
def aprobar_comentario(
    comentario_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    comentario = db.get(Comentario, comentario_id)
    if not comentario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comentario no encontrado")
    comentario.aprobado = True
    db.commit()
    db.refresh(comentario)
    return comentario


@router.delete("/comentarios/{comentario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_comentario(
    comentario_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    comentario = db.get(Comentario, comentario_id)
    if not comentario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comentario no encontrado")
    db.delete(comentario)
    db.commit()
