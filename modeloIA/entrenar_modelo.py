
"""
EcoGuardianAI
Modelo inicial de Machine Learning para clasificar reportes ambientales.
Reto 5: Gestión Ambiental Integral (Residuos y Riesgo).
"""

from pathlib import Path
import joblib

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


# Ruta del proyecto y del modelo entrenado.
CARPETA_MODELO = Path(__file__).resolve().parent
RUTA_MODELO = CARPETA_MODELO / "modelo_ambiental.joblib"



# Ejemplos de entrenamiento para clasificar reportes ambientales.
TEXTOS_ENTRENAMIENTO = [
    # RESIDUOS
    "Basuras acumuladas en la calle",
    "Hay bolsas de basura en el parque",
    "Contenedores de basura llenos",
    "Residuos sólidos sin recoger en la acera",
    "Personas arrojan escombros en un lote",
    "Basura acumulada alrededor de los contenedores",
    "Desechos domésticos abandonados en la vía pública",
    "Punto crítico de acumulación de residuos",
    "Hay basura tirada cerca de las viviendas",
    "Recolección de residuos pendiente en el barrio",

    # INUNDACIÓN
    "La quebrada está creciendo por las lluvias",
    "El agua está entrando a las viviendas",
    "Inundación de la calle por lluvia fuerte",
    "La vía está cubierta de agua",
    "Desbordamiento de una quebrada",
    "Lluvias intensas causan inundaciones en el barrio",
    "Agua acumulada dentro de las casas",
    "Riesgo de inundación cerca del río",
    "Alcantarillas desbordadas por las lluvias",
    "La corriente de agua amenaza las viviendas",

    # DESLIZAMIENTO
    "Se está desprendiendo tierra de la ladera",
    "Hay grietas en el terreno de la montaña",
    "Un deslizamiento amenaza varias viviendas",
    "Caída de piedras desde la ladera",
    "La tierra se está deslizando por la lluvia",
    "Terreno inestable detrás de las casas",
    "Se observa un derrumbe en la montaña",
    "Material rocoso cae sobre la carretera",
    "La ladera presenta señales de movimiento",
    "Riesgo de deslizamiento cerca de las viviendas",

    # CONTAMINACIÓN
    "Quema de basura que produce humo",
    "Malos olores provenientes de residuos quemados",
    "Vertimiento de sustancias contaminantes en la quebrada",
    "Agua contaminada con sustancias químicas",
    "Humo que contamina el aire del barrio",
    "Descarga de aguas contaminadas en el río",
    "Olor fuerte por contaminación ambiental",
    "Residuos tóxicos abandonados en un terreno",
    "Contaminación del agua por vertimientos",
    "Humo excesivo proveniente de una quema",

    # OTRO
    "Luminaria dañada en el parque",
    "Señal de tránsito deteriorada",
    "Solicitud de mantenimiento de un espacio comunitario",
    "Una banca del parque está rota",
    "Daño en el mobiliario de una zona pública",
    "Solicitud de reparación de una vía",
    "Un poste de alumbrado no funciona",
    "Necesidad de mantenimiento de una zona recreativa",
    "Señalización dañada en una calle",
    "Solicitud de recuperación de un espacio comunitario",
]


# EJEMPLOS ADICIONALES PARA MEJORAR LA CLASIFICACIÓN

TEXTOS_ADICIONALES = [
    # RESIDUOS
    "Hay basura acumulada en una esquina del barrio.",
    "Los vecinos reportan bolsas rotas y desperdicios en la acera.",
    "Se observan escombros abandonados en un lote vacío.",
    "El camión recolector no ha recogido los residuos.",
    "Hay residuos domésticos alrededor de un contenedor.",
    "Arrojaron muebles viejos y colchones en la vía pública.",
    "Se acumulan plásticos y empaques cerca de las viviendas.",
    "El punto de recolección está lleno de basura.",
    "Hay residuos sólidos tirados en una zona verde.",
    "Se necesita recoger basura acumulada junto a la carretera.",
    "Hay un colchón abandonado en el andén.",
    "Los desechos están bloqueando el paso peatonal.",
    "Se observan botellas y bolsas tiradas en el parque.",
    "Hay un lote usado como botadero de escombros.",
    "Los residuos llevan varios días sin ser recogidos.",
    "Hay basura alrededor de los contenedores del sector.",
    "Se reporta acumulación de desechos en una calle.",
    "Hay bolsas de basura rotas por animales.",
    "Los habitantes arrojan desperdicios a un lote.",
    "Se necesita retirar residuos acumulados en la acera.",

    # INUNDACIÓN
    "El agua lluvia está entrando a las casas.",
    "La calle quedó inundada después del aguacero.",
    "La quebrada se desbordó y cubrió la vía.",
    "El nivel del agua está subiendo cerca de las viviendas.",
    "Hay agua acumulada en varias calles del barrio.",
    "La lluvia provocó inundaciones en el sector.",
    "El agua cubrió el primer piso de una vivienda.",
    "Una corriente de agua amenaza las casas cercanas.",
    "El río salió de su cauce después de las lluvias.",
    "La vía está anegada y no pueden pasar los peatones.",
    "El agua está entrando por las puertas de las viviendas.",
    "Hay riesgo de desbordamiento de la quebrada.",
    "Las lluvias dejaron varias casas bajo el agua.",
    "El agua se está acumulando frente a las viviendas.",
    "Una inundación afecta el paso por la calle.",
    "La corriente de la quebrada está aumentando.",
    "El agua lluvia cubrió el andén y la carretera.",
    "El sector presenta encharcamientos por lluvias intensas.",
    "El desbordamiento amenaza los locales comerciales.",
    "La calle quedó cubierta de agua durante la tormenta.",

    # DESLIZAMIENTO
    "La ladera presenta grietas y señales de movimiento.",
    "Se desprendió tierra detrás de una vivienda.",
    "Hay piedras cayendo desde una montaña.",
    "Un derrumbe bloqueó parcialmente la carretera.",
    "La pendiente está cediendo después de la lluvia.",
    "Se observa tierra suelta encima de las casas.",
    "Un movimiento de tierra amenaza las viviendas.",
    "Hay rocas desprendidas en una ladera.",
    "El terreno se está hundiendo junto a una casa.",
    "Se presentó un derrumbe en la parte alta del barrio.",
    "La montaña está soltando piedras y tierra.",
    "Aparecieron grietas nuevas en el terreno inclinado.",
    "Hay barro y rocas bajando por la pendiente.",
    "Un talud presenta desprendimientos de material.",
    "La ladera muestra inestabilidad cerca de las viviendas.",
    "Se cayó parte del terreno detrás de una casa.",
    "La lluvia provocó un desprendimiento de tierra.",
    "Hay riesgo de derrumbe en una zona montañosa.",
    "Se desprendió material de un talud junto a la vía.",
    "El suelo de la pendiente presenta grietas profundas.",

    # CONTAMINACIÓN
    "Están quemando basura y el humo afecta a los vecinos.",
    "Sale humo oscuro de una quema de residuos.",
    "El agua de la quebrada tiene espuma y mal olor.",
    "Hay vertimientos contaminantes en una fuente de agua.",
    "Se percibe olor químico fuerte en el sector.",
    "Una descarga de aguas sucias llega al río.",
    "El humo de una quema afecta la calidad del aire.",
    "Hay sustancias extrañas flotando en el agua.",
    "Un líquido contaminante está llegando a la quebrada.",
    "Los vecinos reportan humo tóxico cerca de sus casas.",
    "El agua presenta color extraño y olor desagradable.",
    "Se están vertiendo químicos en un cuerpo de agua.",
    "La quema de materiales genera humo en la zona.",
    "Hay una descarga de aguas residuales al río.",
    "Se observa una película aceitosa sobre el agua.",
    "El aire está afectado por humo y gases.",
    "Se reporta contaminación del agua por vertimientos.",
    "Una sustancia desconocida está contaminando el suelo.",
    "El humo de la quema entra por las ventanas.",
    "Hay malos olores provenientes de una descarga contaminante.",

    # OTRO
    "La luminaria de la calle dejó de funcionar.",
    "Una banca del parque está dañada.",
    "La señal de tránsito está rota.",
    "Se necesita reparar el mobiliario del parque.",
    "Hay un hueco en la vía que requiere mantenimiento.",
    "Un poste de alumbrado público está averiado.",
    "La cancha del barrio necesita reparación.",
    "Se dañó una señalización peatonal.",
    "Una baranda del espacio público está rota.",
    "Se solicita mantenimiento de una zona recreativa.",
    "Hay un juego infantil dañado en el parque.",
    "La tapa de una caja de servicios está deteriorada.",
    "Se necesita reparar una acera deteriorada.",
    "Un elemento del mobiliario urbano está roto.",
    "La iluminación de la zona comunitaria no funciona.",
    "Se solicita arreglar las bancas de la plaza.",
    "Una señal informativa está deteriorada.",
    "Hay daños en los juegos del parque infantil.",
    "Se necesita mantenimiento de una vía del barrio.",
    "Una estructura del espacio público requiere reparación.",
]

ETIQUETAS_ADICIONALES = (
    ["Residuos"] * 20
    + ["Inundación"] * 20
    + ["Deslizamiento"] * 20
    + ["Contaminación"] * 20
    + ["Otro"] * 20
)


ETIQUETAS = (
    ["Residuos"] * 10
    + ["Inundación"] * 10
    + ["Deslizamiento"] * 10
    + ["Contaminación"] * 10
    + ["Otro"] * 10
)

TEXTOS_ENTRENAMIENTO.extend(TEXTOS_ADICIONALES)
ETIQUETAS.extend(ETIQUETAS_ADICIONALES)

def entrenar_modelo():
    """Entrena y guarda el clasificador de reportes ambientales."""

    modelo = Pipeline([
        (
            "texto",
            TfidfVectorizer(
                lowercase=True,
                strip_accents="unicode",
                ngram_range=(1, 2),
            ),
        ),
        (
            "clasificador",
            LogisticRegression(
                max_iter=1000,
                random_state=42,
            ),
        ),
    ])

    modelo.fit(TEXTOS_ENTRENAMIENTO, ETIQUETAS)

    joblib.dump(modelo, RUTA_MODELO)

    print("Modelo ambiental entrenado correctamente.")
    print(f"Archivo guardado en: {RUTA_MODELO}")
    print(f"Ejemplos de entrenamiento: {len(TEXTOS_ENTRENAMIENTO)}")

    return modelo


if __name__ == "__main__":
    entrenar_modelo()
