from pathlib import Path
import joblib
from sklearn.metrics import accuracy_score, classification_report

RUTA = Path(__file__).resolve().parent / "modelo_ambiental.joblib"
modelo = joblib.load(RUTA)

TEXTOS = [
    "Hay mucha basura en la quebrada.",
    "El agua está subiendo y amenaza las casas.",
    "Se cayó parte de la montaña detrás de mi casa.",
    "Están quemando basura y el humo entra por las ventanas.",
    "La alcantarilla está tapada y cuando llueve se inunda la calle.",
    "Hay bolsas de basura y malos olores.",
    "La calle tiene un hueco muy grande.",
    "Se ven grietas en una vivienda y en la ladera.",
    "El agua del río tiene espuma y huele mal.",
    "Necesitamos arreglar las bancas del parque.",
]

REALES = [
    "Residuos",
    "Inundación",
    "Deslizamiento",
    "Contaminación",
    "Inundación",
    "Residuos",
    "Otro",
    "Deslizamiento",
    "Contaminación",
    "Otro",
]

PREDICHAS = modelo.predict(TEXTOS)

print("\n=== EVALUACIÓN DEL MODELO MEJORADO ===")
print(f"Ejemplos evaluados: {len(TEXTOS)}")
print(f"Aciertos: {sum(a == b for a, b in zip(REALES, PREDICHAS))} de {len(TEXTOS)}")
print(f"Exactitud: {accuracy_score(REALES, PREDICHAS):.1%}")

print("\n=== RESULTADOS POR CATEGORÍA ===")
print(classification_report(REALES, PREDICHAS, zero_division=0))

print("\n=== DETALLE ===")
for texto, real, pred in zip(TEXTOS, REALES, PREDICHAS):
    estado = "CORRECTO" if real == pred else "REVISAR"
    print(f"{estado} | Esperado: {real} | Predicho: {pred} | {texto}")
