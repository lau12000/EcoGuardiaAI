from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.app.database import get_db
from backend.app.models.usuario import Usuario, UsuarioDB


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


def convertir_usuario(usuario: UsuarioDB) -> dict:
    """Convierte un usuario de la base de datos en un diccionario."""
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "documento": usuario.documento,
        "correo": usuario.correo,
        "telefono": usuario.telefono,
        "ciudad": usuario.ciudad
    }


@router.post("/")
def registrar_usuario(
    usuario: Usuario,
    db: Session = Depends(get_db)
):
    """Registra un usuario y controla los datos duplicados."""

    documento_existente = db.query(UsuarioDB).filter(
        UsuarioDB.documento == usuario.documento
    ).first()

    if documento_existente:
        raise HTTPException(
            status_code=409,
            detail="Ya existe un usuario con ese documento."
        )

    correo_normalizado = str(usuario.correo).strip().lower()

    correo_existente = db.query(UsuarioDB).filter(
        UsuarioDB.correo == correo_normalizado
    ).first()

    if correo_existente:
        raise HTTPException(
            status_code=409,
            detail="Ya existe un usuario con ese correo electrónico."
        )

    nuevo_usuario = UsuarioDB(
        nombre=usuario.nombre.strip(),
        apellido=usuario.apellido.strip(),
        documento=usuario.documento.strip(),
        correo=correo_normalizado,
        telefono=usuario.telefono.strip(),
        ciudad=usuario.ciudad.strip()
    )

    try:
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)

        return {
            "mensaje": "Usuario registrado correctamente",
            "usuario": convertir_usuario(nuevo_usuario)
        }

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="El documento o correo ya está registrado."
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="No fue posible registrar el usuario."
        )


@router.get("/")
def listar_usuarios(db: Session = Depends(get_db)):
    """Lista los usuarios registrados."""

    usuarios = (
        db.query(UsuarioDB)
        .order_by(UsuarioDB.id.asc())
        .all()
    )

    return {
        "cantidad": len(usuarios),
        "usuarios": [
            convertir_usuario(usuario)
            for usuario in usuarios
        ]
    }