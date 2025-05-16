import pymysql
pymysql.install_as_MySQLdb()

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
import models
from utils import allowed_file  # importar desde utils.py

# Inicializar app
app = Flask(__name__)
app.config.from_object(Config)

# Configuración de la carpeta de subida (esto DEBE ir antes de registrar rutas)
UPLOAD_FOLDER = os.path.join("static", "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Inicializar extensiones
db.init_app(app)
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173"],  # o usa "*" solo para pruebas
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})


# ✅ RUTA DE PRUEBA PARA VER HEADERS
@app.route("/api/test-headers", methods=["POST"])
def test_headers():
    print("🟡 Headers recibidos:", dict(request.headers))
    return jsonify({"msg": "Headers recibidos correctamente"}), 200


# Registrar blueprints (después de configurar todo)
from routes.auth_routes import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")

from routes.restaurant_routes import restaurant_bp
app.register_blueprint(restaurant_bp, url_prefix="/api/restaurantes")

from routes.review_routes import review_bp
app.register_blueprint(review_bp, url_prefix="/api/resenas")

from routes.comment_routes import comment_bp
app.register_blueprint(comment_bp, url_prefix="/api/comentarios")

from routes.user_routes import user_bp
app.register_blueprint(user_bp, url_prefix="/api/usuarios")

from routes.publication_routes import publication_bp
app.register_blueprint(publication_bp, url_prefix="/api/publicaciones")


# Crear tablas en la BD
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True,)
