
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.app.database import get_db
from backend.app.models.reporte import ReporteDB
from backend.app.models.usuario import UsuarioDB

from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile, File

router = APIRouter(
    prefix="/reportes",
    tags=["Reportes Ambientales"]
)
BASE_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = BASE_DIR / "uploads" / "reportes"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

EXTENSIONES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp"}
TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024

def convertir_reporte(reporte: ReporteDB) -> dict:
    """Convierte un reporte de la base de datos en un diccionario."""
    return {
        "id": reporte.id,
        "usuario_id": reporte.usuario_id,
        "tipo": reporte.tipo,
        "descripcion": reporte.descripcion,
        "ciudad": reporte.ciudad,
        "direccion": reporte.direccion,
        "latitud": reporte.latitud,
        "longitud": reporte.longitud,
        "estado": reporte.estado,
        "contacto_nombre": reporte.contacto_nombre,
        "contacto_telefono": reporte.contacto_telefono,
        "contacto_correo": reporte.contacto_correo,
        "foto_url": reporte.foto_url
    }


@router.post("/")
async def crear_reporte(
    usuario_id: int = Query(...),
    tipo: str = Query(..., min_length=1),
    descripcion: str = Query(..., min_length=1),
    ciudad: str = Query(..., min_length=1),
    direccion: str = Query(..., min_length=1),
    contacto_nombre: str = Query(..., min_length=2, max_length=150),
    contacto_telefono: str = Query(..., min_length=7, max_length=20),
    contacto_correo: str | None = Query(None, max_length=254),
    latitud: float | None = Query(None),
    longitud: float | None = Query(None),
    foto: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    """Registra un reporte con los datos de contacto."""

    usuario = db.query(UsuarioDB).filter(
        UsuarioDB.id == usuario_id
    ).first()

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail=f"No existe un usuario con ID {usuario_id}."
        )

    if (latitud is None) != (longitud is None):
        raise HTTPException(
            status_code=422,
            detail="Debes proporcionar latitud y longitud juntas."
        )

    if not contacto_nombre.strip():
        raise HTTPException(
            status_code=422,
            detail="El nombre de contacto es obligatorio."
        )

    if not contacto_telefono.strip():
        raise HTTPException(
            status_code=422,
            detail="El teléfono de contacto es obligatorio."
        )
    
    ruta_foto = None
    archivo_guardado = None

    if foto is not None and foto.filename:
        extension = Path(foto.filename).suffix.lower()

        if extension not in EXTENSIONES_PERMITIDAS:
            raise HTTPException(
                status_code=400,
                detail="Formato no permitido. Usa JPG, JPEG, PNG o WEBP."
            )

        if not foto.content_type or not foto.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="El archivo seleccionado no es una imagen válida."
            )

        contenido = await foto.read()

        if len(contenido) > TAMANO_MAXIMO_FOTO:
            raise HTTPException(
                status_code=400,
                detail="La fotografía no puede superar los 5 MB."
            )

        if not contenido:
            raise HTTPException(
                status_code=400,
                detail="La fotografía está vacía."
            )

        nombre_archivo = f"{uuid4().hex}{extension}"
        archivo_guardado = UPLOAD_DIR / nombre_archivo
        ruta_foto = f"/uploads/reportes/{nombre_archivo}"

        archivo_guardado.write_bytes(contenido)


    reporte = ReporteDB(
        usuario_id=usuario_id,
        tipo=tipo.strip(),
        descripcion=descripcion.strip(),
        ciudad=ciudad.strip(),
        direccion=direccion.strip(),
        latitud=latitud,
        longitud=longitud,
        estado="Pendiente",
        contacto_nombre=contacto_nombre.strip(),
        contacto_telefono=contacto_telefono.strip(),
        contacto_correo=(
            contacto_correo.strip().lower()
            if contacto_correo and contacto_correo.strip()
            else None
        ),
        foto_url=ruta_foto,
    )

    try:
        db.add(reporte)
        db.commit()
        db.refresh(reporte)

        return {
            "mensaje": "Reporte registrado correctamente",
            "reporte": convertir_reporte(reporte),
        }

    
    except SQLAlchemyError:
        db.rollback()

        if archivo_guardado is not None and archivo_guardado.exists():
            try:
                archivo_guardado.unlink()
            except OSError:
                pass

        raise HTTPException(
            status_code=500,
            detail="No fue posible guardar el reporte. Verifica la base de datos."
        )



@router.get("/")
def listar_reportes(db: Session = Depends(get_db)):
    """Devuelve todos los reportes registrados."""

    reportes = (
        db.query(ReporteDB)
        .order_by(ReporteDB.id.asc())
        .all()
    )

    return {
        "cantidad": len(reportes),
        "reportes": [
            convertir_reporte(reporte)
            for reporte in reportes
        ],
    }


@router.put("/{reporte_id}/estado")
def actualizar_estado(
    reporte_id: int,
    estado: str = Query(...),
    db: Session = Depends(get_db),
):
    """Actualiza el estado de un reporte existente."""

    estados_validos = {
        "Pendiente",
        "En revisión",
        "Atendido",
    }

    if estado not in estados_validos:
        raise HTTPException(
            status_code=422,
            detail="Estado no válido. Usa: Pendiente, En revisión o Atendido."
        )

    reporte = db.query(ReporteDB).filter(
        ReporteDB.id == reporte_id
    ).first()

    if reporte is None:
        raise HTTPException(
            status_code=404,
            detail="El reporte no existe."
        )

    reporte.estado = estado
    db.commit()
    db.refresh(reporte)

    return {
        "mensaje": "Estado actualizado correctamente",
        "reporte": convertir_reporte(reporte),
    }


@router.get("/{reporte_id}")
def obtener_reporte(
    reporte_id: int,
    db: Session = Depends(get_db),
):
    """Consulta un reporte por su identificador."""

    reporte = db.query(ReporteDB).filter(
        ReporteDB.id == reporte_id
    ).first()

    if reporte is None:
        raise HTTPException(
            status_code=404,
            detail="El reporte no existe."
        )

    return convertir_reporte(reporte)


@router.delete("/{reporte_id}")
def eliminar_reporte(
    reporte_id: int,
    db: Session = Depends(get_db),
):
    """Elimina un reporte únicamente cuando se solicita."""

    reporte = db.query(ReporteDB).filter(
        ReporteDB.id == reporte_id
    ).first()

    if reporte is None:
        raise HTTPException(
            status_code=404,
            detail="El reporte no existe."
        )

    db.delete(reporte)
    db.commit()

    return {
        "mensaje": "Reporte eliminado correctamente",
        "id": reporte_id,
    }
