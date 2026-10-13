
"""Predicción de categorías ambientales con EcoGuardianAI."""

from pathlib import Path
import joblib

RUTA_MODELO = Path(__file__).resolve().parent / "modelo_ambiental.joblib"


def clasificar_reporte(descripcion: str) -> dict:
    """Clasifica una descripción ambiental con el modelo entrenado."""

    if not descripcion or not descripcion.strip():
        raise ValueError("La descripción del reporte no puede estar vacía.")

    modelo = joblib.load(RUTA_MODELO)
    categoria = modelo.predict([descripcion.strip()])[0]

    probabilidades = modelo.predict_proba([descripcion.strip()])[0]
    confianza = float(max(probabilidades))

    return {
        "categoria_ia": categoria,
        "confianza_modelo": round(confianza, 4),
        "advertencia": (
            "Prototipo experimental: la confianza no equivale a "
            "una probabilidad validada de acierto."
        ),
    }


if __name__ == "__main__":
    ejemplos = [
        "Hay bolsas de basura acumuladas en el parque.",
        "El agua de la quebrada está entrando a las viviendas.",
        "Se está desprendiendo tierra de la ladera.",
        "Hay humo y malos olores por quema de residuos.",
    ]

    for descripcion in ejemplos:
        resultado = clasificar_reporte(descripcion)
        print(f"\nReporte: {descripcion}")
        print(f"Resultado IA: {resultado}")
