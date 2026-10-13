from pathlib import Path
import joblib

RUTA = Path(__file__).resolve().parent / "modelo_ambiental.joblib"
modelo = joblib.load(RUTA)

CASOS = [
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

print("\n=== PRUEBAS DE CASOS DIFICILES ===")
for texto in CASOS:
    probabilidades = modelo.predict_proba([texto])[0]
    indice = probabilidades.argmax()
    categoria = modelo.classes_[indice]
    confianza = float(probabilidades[indice])

    print(f"\nReporte: {texto}")
    print(f"Categoria: {categoria}")
    print(f"Confianza del modelo: {confianza:.1%}")
