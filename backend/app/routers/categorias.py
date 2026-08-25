from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models import Categoria
from app.schemas import CategoriaCreate, CategoriaOut, CategoriaUpdate

router = APIRouter(prefix="/api/categorias", tags=["categorias"])


@router.get("", response_model=list[CategoriaOut])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).order_by(Categoria.nombre).all()


@router.get("/{categoria_id}", response_model=CategoriaOut)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return categoria


@router.post("", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    payload: CategoriaCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    if db.query(Categoria).filter(Categoria.slug == payload.slug).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug ya existe")
    categoria = Categoria(**payload.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.put("/{categoria_id}", response_model=CategoriaOut)
def actualizar_categoria(
    categoria_id: int,
    payload: CategoriaUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    categoria = db.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    for field, value in payload.model_dump().items():
        setattr(categoria, field, value)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    categoria = db.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    db.delete(categoria)
    db.commit()
