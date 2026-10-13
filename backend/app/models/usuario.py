from sqlalchemy import Column, Integer, String
from pydantic import BaseModel, EmailStr

from backend.app.database import Base


class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    documento = Column(String, unique=True, nullable=False)
    correo = Column(String, unique=True, nullable=False)
    telefono = Column(String, nullable=False)
    ciudad = Column(String, nullable=False)


class Usuario(BaseModel):
    nombre: str
    apellido: str
    documento: str
    correo: EmailStr
    telefono: str
    ciudad: str