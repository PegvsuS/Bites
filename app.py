import pymysql
pymysql.install_as_MySQLdb()

import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
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
CORS(app)

# Registrar blueprints (después de configurar todo)
from routes.auth_routes import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")

from routes.restaurant_routes import restaurant_bp
app.register_blueprint(restaurant_bp, url_prefix="/api/restaurantes")

from routes.review_routes import review_bp
app.register_blueprint(review_bp, url_prefix="/api/resenas")

from routes.comment_routes import comment_bp
app.register_blueprint(comment_bp, url_prefix="/api/comentarios")

# Crear tablas en la BD
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
