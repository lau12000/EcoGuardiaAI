
"""Evaluación inicial independiente de EcoGuardianAI."""

from pathlib import Path
import joblib
from sklearn.metrics import accuracy_score, classification_report

CARPETA_MODELO = Path(__file__).resolve().parent
RUTA_MODELO = CARPETA_MODELO / "modelo_ambiental.joblib"

# Ejemplos nuevos, separados de los 50 textos de entrenamiento.
TEXTOS_PRUEBA = [
    "Hay desperdicios y bolsas acumuladas junto a los contenedores.",
    "Los habitantes dejan residuos domésticos en una esquina.",
    "El agua de lluvia cubrió las casas de la zona.",
    "La quebrada se salió de su cauce y anegó la calle.",
    "Se observan grietas y tierra desprendida en una pendiente.",
    "Piedras y lodo bajaron de la montaña hacia las viviendas.",
    "Un humo intenso sale de la quema de materiales en el barrio.",
    "Se descargan líquidos contaminantes en una fuente de agua.",
    "El parque necesita reparación de sus bancas.",
    "Una señal de tránsito está rota y requiere mantenimiento.",
]

ETIQUETAS_REALES = [
    "Residuos",
    "Residuos",
    "Inundación",
    "Inundación",
    "Deslizamiento",
    "Deslizamiento",
    "Contaminación",
    "Contaminación",
    "Otro",
    "Otro",
]


def main():
    if not RUTA_MODELO.exists():
        raise FileNotFoundError(
            f"No se encontró el modelo: {RUTA_MODELO}"
        )

    modelo = joblib.load(RUTA_MODELO)
    predicciones = modelo.predict(TEXTOS_PRUEBA)

    exactitud = accuracy_score(ETIQUETAS_REALES, predicciones)

    print("\n=== EVALUACIÓN INICIAL DE ECOGUARDIANAI ===")
    print(f"Ejemplos evaluados: {len(TEXTOS_PRUEBA)}")
    print(f"Aciertos: {(predicciones == ETIQUETAS_REALES).sum()}")
    print(f"Exactitud de esta prueba: {exactitud:.2%}")

    print("\n=== DETALLE POR CATEGORÍA ===")
    print(
        classification_report(
            ETIQUETAS_REALES,
            predicciones,
            labels=[
                "Residuos",
                "Inundación",
                "Deslizamiento",
                "Contaminación",
                "Otro",
            ],
            zero_division=0,
        )
    )

    print("=== PREDICCIONES ===")
    for texto, real, predicha in zip(
        TEXTOS_PRUEBA, ETIQUETAS_REALES, predicciones
    ):
        resultado = "CORRECTO" if real == predicha else "REVISAR"
        print(f"\nTexto: {texto}")
        print(f"Categoría esperada: {real}")
        print(f"Categoría predicha: {predicha}")
        print(f"Resultado: {resultado}")


if __name__ == "__main__":
    main()
