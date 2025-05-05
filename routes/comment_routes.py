# routes/comment_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Comentario, LikeComentario, Resena

comment_bp = Blueprint("comentarios", __name__)

# Crear comentario
@comment_bp.route("/", methods=["POST"])
@jwt_required()
def crear_comentario():
    data = request.get_json()
    texto = data.get("texto")  # Usamos 'texto' para coincidir con el modelo
    resena_id = data.get("resena_id")
    user_id = get_jwt_identity()

    if not texto or not resena_id:
        return jsonify({"msg": "Texto y resena_id son requeridos"}), 400

    nuevo = Comentario(resena_id=resena_id, usuario_id=user_id, texto=texto)
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"msg": "Comentario creado", "id": nuevo.id}), 201

# Obtener comentarios de una reseña
@comment_bp.route("/resena/<int:resena_id>", methods=["GET"])
def obtener_comentarios(resena_id):
    comentarios = Comentario.query.filter_by(resena_id=resena_id).all()
    resultado = [{
        "id": c.id,
        "texto": c.texto,  # Corregido: 'texto' en lugar de 'contenido'
        "usuario_id": c.usuario_id,
        "fecha": c.fecha.isoformat(),
        "likes": len(c.likes)
    } for c in comentarios]
    return jsonify(resultado), 200

# Dar o quitar like
@comment_bp.route("/<int:comentario_id>/like", methods=["POST"])
@jwt_required()
def toggle_like(comentario_id):
    user_id = get_jwt_identity()
    existing = LikeComentario.query.filter_by(comentario_id=comentario_id, usuario_id=user_id).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"msg": "Like eliminado"}), 200
    else:
        nuevo_like = LikeComentario(comentario_id=comentario_id, usuario_id=user_id)
        db.session.add(nuevo_like)
        db.session.commit()
        return jsonify({"msg": "Like añadido"}), 201
    
#Eliminar comentario
# Eliminar comentario (solo si es del usuario)
@comment_bp.route("/<int:comentario_id>", methods=["DELETE"])
@jwt_required()
def eliminar_comentario(comentario_id):
    user_id = get_jwt_identity()
    comentario = Comentario.query.get_or_404(comentario_id)

    if comentario.usuario_id != user_id:
        return jsonify({"msg": "No tienes permiso para eliminar este comentario"}), 403

    db.session.delete(comentario)
    db.session.commit()
    return jsonify({"msg": "Comentario eliminado correctamente"}), 200

