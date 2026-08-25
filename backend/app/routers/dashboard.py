from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models import Categoria, Comentario, Marca, Producto
from app.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def obtener_stats(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return DashboardStats(
        total_productos=db.query(func.count(Producto.id)).scalar() or 0,
        total_categorias=db.query(func.count(Categoria.id)).scalar() or 0,
        total_marcas=db.query(func.count(Marca.id)).scalar() or 0,
        productos_sin_stock=db.query(func.count(Producto.id))
        .filter(Producto.stock == 0)
        .scalar()
        or 0,
        comentarios_pendientes=db.query(func.count(Comentario.id))
        .filter(Comentario.aprobado.is_(False))
        .scalar()
        or 0,
    )
