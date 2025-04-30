import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db 

# Inicializar app
app = Flask(__name__)
app.config.from_object(Config)

# Extensiones
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

# Importar rutas
from routes.auth_routes import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")

from routes.restaurant_routes import restaurant_bp
app.register_blueprint(restaurant_bp, url_prefix="/api/restaurantes")

from routes.review_routes import review_bp
app.register_blueprint(review_bp, url_prefix="/api/resenas")


# Crear tablas
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
