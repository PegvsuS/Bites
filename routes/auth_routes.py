from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from datetime import timedelta
from models import db, Usuario  # ahora todo bien aquí

auth_bp = Blueprint('auth', __name__)


# Registro
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nombre = data.get('nombre')
    email = data.get('email')
    password = data.get('password')

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"msg": "El email ya está registrado"}), 400

    nuevo_usuario = Usuario(nombre=nombre, email=email)
    nuevo_usuario.set_password(password)
    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({"msg": "Usuario registrado con éxito"}), 201

# Login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario or not usuario.check_password(password):
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    access_token = create_access_token(identity=str(usuario.id), expires_delta=timedelta(days=1))


    return jsonify({
        "token": access_token,
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email
        }
    }), 200
