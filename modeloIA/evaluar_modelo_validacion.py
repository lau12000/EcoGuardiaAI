
from pathlib import Path
import joblib

RUTA_MODELO = Path(__file__).resolve().parent / "modelo_ambiental.joblib"
modelo = joblib.load(RUTA_MODELO)

# Casos etiquetados manualmente para una primera comprobación.
CASOS = [
    ("Hay mucha basura en la quebrada.", "Residuos"),
    ("El agua está subiendo y amenaza las casas.", "Inundación"),
    ("Se cayó parte de la montaña detrás de mi casa.", "Deslizamiento"),
    ("Están quemando basura y el humo entra por las ventanas.", "Contaminación"),
    ("La alcantarilla está tapada y cuando llueve se inunda la calle.", "Inundación"),
    ("Hay bolsas de basura y malos olores.", "Residuos"),
    ("La calle tiene un hueco muy grande.", "Otro"),
    ("Se ven grietas en una vivienda y en la ladera.", "Deslizamiento"),
    ("El agua del río tiene espuma y huele mal.", "Contaminación"),
    ("Necesitamos arreglar las bancas del parque.", "Otro"),
]

aciertos = 0

print("\n=== EVALUACIÓN INICIAL DE ECOGUARDIANAI ===")

for texto, esperada in CASOS:
    probabilidades = modelo.predict_proba([texto])[0]
    indice = probabilidades.argmax()
    predicha = str(modelo.classes_[indice])
    confianza = float(probabilidades[indice])

    correcto = predicha.casefold() == esperada.casefold()
    aciertos += int(correcto)

    estado = "CORRECTO" if correcto else "REVISAR"

    print(f"\nDescripción: {texto}")
    print(f"Categoría esperada: {esperada}")
    print(f"Categoría predicha: {predicha}")
    print(f"Puntuación del modelo: {confianza:.1%}")
    print(f"Resultado: {estado}")

print("\n=== RESUMEN ===")
print(f"Casos evaluados: {len(CASOS)}")
print(f"Aciertos: {aciertos}")
print(f"Errores: {len(CASOS) - aciertos}")
print(f"Acierto en esta muestra: {aciertos / len(CASOS):.1%}")
print("Nota: esta muestra es pequeña y no demuestra el rendimiento general.")
