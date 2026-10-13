from flask import Flask

app = Flask(__name__)


@app.route("/")
def inicio():
    return "EcoGuardian AI - API funcionando correctamente"


if __name__ == "__main__":
    app.run(debug=True)