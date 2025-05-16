from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models import db, Publicacion, Usuario
from datetime import datetime

publication_bp = Blueprint("publicaciones", __name__)

@publication_bp.route("/", methods=["POST"])
@jwt_required()
def crear_publicacion():
    print("🟡 Headers:", dict(request.headers))
    data = request.get_json()
    user_id = get_jwt_identity()

    
    contenido = data.get("contenido")
    etiqueta = data.get("etiqueta_restaurante")

    if not contenido:
        return jsonify({"msg": "Contenido es requerido"}), 400

    publicacion = Publicacion(
        usuario_id=user_id,
        contenido=contenido,
        etiqueta_restaurante=etiqueta
    )

    db.session.add(publicacion)
    db.session.commit()

    return jsonify({"msg": "Publicación creada"}), 201

# @publication_bp.route("/", methods=["POST"])
# def crear_publicacion():
#     print("🔍 Headers recibidos:", dict(request.headers))

#     try:
#         verify_jwt_in_request()
#         user_id = get_jwt_identity()
#         print("✅ Usuario autenticado:", user_id)
#     except Exception as e:
#         print("❌ Error autenticación JWT:", e)
#         return jsonify({"msg": "Token inválido"}), 401

#     return jsonify({"msg": "Pasa el JWT, ahora podemos crear la publicación"}), 200


