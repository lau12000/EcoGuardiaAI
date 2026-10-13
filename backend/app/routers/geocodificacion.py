import json
import re
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(
    prefix="/geocodificar",
    tags=["Geocodificación de direcciones"],
)


def normalizar_direccion(direccion: str) -> str:
    """Normaliza abreviaturas comunes de direcciones colombianas."""
    texto = direccion.strip()
    reemplazos = [
        (r"\bcll?\.?\b", "Calle"),
        (r"\bcra\.?\b|\bkr\.?\b|\bcr\.?\b", "Carrera"),
        (r"\bdg\.?\b", "Diagonal"),
        (r"\btv\.?\b|\btransv\.?\b", "Transversal"),
        (r"\bav\.?\b", "Avenida"),
    ]
    for patron, reemplazo in reemplazos:
        texto = re.sub(patron, reemplazo, texto, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", texto).strip()


def consultar_photon(texto_busqueda: str):
    """Consulta Photon y devuelve resultados de lugares o direcciones."""
    parametros = urlencode({
        "q": texto_busqueda,
        "limit": 10,
        "lat": 6.2442,
        "lon": -75.5812,
    })
    url = f"https://photon.komoot.io/api/?{parametros}"
    solicitud = Request(
        url,
        headers={
            "User-Agent": "EcoGuardianAI/1.0 (geocodificacion)",
            "Accept": "application/json",
        },
    )
    try:
        with urlopen(solicitud, timeout=20) as respuesta:
            datos = json.loads(respuesta.read().decode("utf-8"))
    except HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"El servicio de geocodificación respondió con HTTP {error.code}.",
        )
    except (URLError, TimeoutError):
        raise HTTPException(
            status_code=503,
            detail="No fue posible conectar con el servicio de geocodificación. Verifica tu conexión.",
        )
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(
            status_code=502,
            detail="El servicio de geocodificación devolvió una respuesta no válida.",
        )

    opciones = []
    for elemento in datos.get("features", []):
        propiedades = elemento.get("properties", {}) or {}
        geometria = elemento.get("geometry", {}) or {}
        coordenadas = geometria.get("coordinates", [])
        if not isinstance(coordenadas, list) or len(coordenadas) < 2:
            continue
        try:
            longitud = float(coordenadas[0])
            latitud = float(coordenadas[1])
        except (TypeError, ValueError):
            continue

        partes = [
            propiedades.get("name"),
            propiedades.get("housenumber"),
            propiedades.get("street"),
            propiedades.get("district"),
            propiedades.get("locality"),
            propiedades.get("city"),
            propiedades.get("state"),
            propiedades.get("country"),
        ]
        direccion_formateada = ", ".join(
            dict.fromkeys(str(parte).strip() for parte in partes if parte)
        )
        opciones.append({
            "direccion": direccion_formateada or texto_busqueda,
            "latitud": latitud,
            "longitud": longitud,
            "numero_encontrado": propiedades.get("housenumber"),
            "tipo": propiedades.get("type", ""),
            "categoria": propiedades.get("osm_value", ""),
            "precision": (
                "con número"
                if propiedades.get("housenumber")
                else "por verificar en el mapa"
            ),
        })
    return opciones


def extraer_numero_direccion(direccion: str):
    """Extrae el número después de #; ej. 50-21 en Calle 50 # 50-21."""
    coincidencia = re.search(
        r"#\s*(\d+(?:\s*-\s*\d+)?[A-Za-z]?)",
        direccion,
        flags=re.IGNORECASE,
    )
    if not coincidencia:
        return None
    return re.sub(r"\s+", "", coincidencia.group(1)).casefold()


@router.get("/")
def buscar_direccion(
    direccion: str = Query(..., min_length=3, max_length=200),
    ciudad: str = Query("Medellín", min_length=2, max_length=100),
):
    """Busca nombres de lugares y direcciones; devuelve opciones para confirmar."""
    texto = direccion.strip()
    ciudad_limpia = ciudad.strip() or "Medellín"
    normalizada = normalizar_direccion(texto)
    numero_solicitado = extraer_numero_direccion(texto)

    sin_numero = re.sub(r"\s*#\s*", " ", normalizada)
    sin_numero = re.sub(r"\s+", " ", sin_numero).strip()

    consultas = [
        f"{texto}, {ciudad_limpia}, Antioquia, Colombia",
        f"{normalizada}, {ciudad_limpia}, Antioquia, Colombia",
        f"{sin_numero}, {ciudad_limpia}, Antioquia, Colombia",
        f"{texto}, Colombia",
    ]
    consultas = list(dict.fromkeys(q for q in consultas if q.strip()))

    resultados_unicos = {}
    errores = []
    for consulta in consultas:
        try:
            for resultado in consultar_photon(consulta):
                clave = (
                    round(resultado["latitud"], 6),
                    round(resultado["longitud"], 6),
                )
                existente = resultados_unicos.get(clave)
                if existente is None or len(resultado["direccion"]) > len(existente["direccion"]):
                    resultados_unicos[clave] = resultado
        except HTTPException as error:
            errores.append(error)

    if not resultados_unicos and errores:
        raise errores[0]

    opciones = list(resultados_unicos.values())
    if not opciones:
        return {
            "encontrado": False,
            "coincidencia_exacta": False,
            "mensaje": (
                "No encontramos ese lugar o dirección. Prueba agregando el barrio "
                "o la ciudad, o escribe el nombre del sitio con más detalle."
            ),
            "resultados": [],
        }

    palabras = [
        p for p in re.findall(r"[a-záéíóúñ0-9]+", normalizada.casefold())
        if p not in {
            "calle", "cl", "carrera", "cra", "cr", "kr",
            "diagonal", "transversal", "tv", "avenida", "av",
            "medellin", "medellín", "antioquia", "colombia",
        }
    ]

    def puntuar(resultado):
        texto_resultado = resultado["direccion"].casefold()
        coincidencias = sum(1 for palabra in palabras if palabra in texto_resultado)
        numero = resultado.get("numero_encontrado")
        coincide_numero = (
            numero_solicitado is not None
            and numero is not None
            and re.sub(r"\s+", "", str(numero)).casefold() == numero_solicitado
        )
        return (
            coincide_numero,
            coincidencias,
            bool(resultado.get("categoria")),
            bool(numero),
        )

    opciones.sort(key=puntuar, reverse=True)
    opciones = opciones[:5]

    hay_coincidencia = False
    for resultado in opciones:
        numero = resultado.get("numero_encontrado")
        coincide = (
            numero_solicitado is not None
            and numero is not None
            and re.sub(r"\s+", "", str(numero)).casefold() == numero_solicitado
        )
        resultado["coincidencia_exacta"] = coincide
        resultado["precision"] = (
            "coincidencia de número" if coincide else "por verificar en el mapa"
        )
        hay_coincidencia = hay_coincidencia or coincide

    if numero_solicitado and not hay_coincidencia:
        mensaje = (
            f"No pudimos verificar el número {numero_solicitado}. "
            "Los resultados son aproximados; comprueba el punto en el mapa antes de guardar."
        )
    elif hay_coincidencia:
        mensaje = (
            "Se encontró un resultado con el número solicitado. "
            "Comprueba que el marcador corresponda a la dirección antes de confirmar."
        )
    else:
        mensaje = (
            "Selecciona el resultado que corresponda al lugar y comprueba "
            "su ubicación en el mapa antes de registrar el reporte."
        )

    return {
        "encontrado": True,
        "coincidencia_exacta": hay_coincidencia,
        "mensaje": mensaje,
        "resultados": opciones,
    }
