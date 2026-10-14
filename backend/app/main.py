from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import engine, Base
from backend.app.models.usuario import UsuarioDB
from backend.app.models.reporte import ReporteDB
from backend.app.routers.usuarios import router as usuarios_router
from backend.app.routers.reportes import router as reportes_router
from backend.app.routers.geocodificacion import router as geocodificacion_router
from backend.app.routers.ia import router as ia_router

from pathlib import Path
from fastapi.staticfiles import StaticFiles

from backend.app.models.analisis_ia import AnalisisIADB

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoGuardianAI",
    description="API para gestión ambiental, residuos y riesgos naturales.",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ecoguardia-web.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Carpeta para servir las fotografías de los reportes
BASE_DIR = Path(__file__).resolve().parents[2]
CARPETA_UPLOADS = BASE_DIR / "uploads"
CARPETA_UPLOADS.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(CARPETA_UPLOADS)),
    name="uploads"
)


@app.get("/")
def inicio():
    return {
        "mensaje": "EcoGuardianAI está funcionando",
        "estado": "correcto"
    }


@app.get("/salud")
def salud():
    return {
        "estado": "ok"
    }


app.include_router(usuarios_router)
app.include_router(reportes_router)
app.include_router(geocodificacion_router)
app.include_router(ia_router)