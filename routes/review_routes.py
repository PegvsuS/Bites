from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Reseña, Usuario, Restaurante

review_bp = Blueprint('resenas', __name__)

# Crear reseña
@review_bp.route('/', methods=['POST'])
@jwt_required()
def crear_resena():
    data = request.get_json()
    usuario_id = get_jwt_identity()
    restaurante_id = data.get('restaurante_id')
    comentario = data.get('comentario')
    valoracion = data.get('valoracion')

    nueva = Reseña(
        usuario_id=usuario_id,
        restaurante_id=restaurante_id,
        comentario=comentario,
        valoracion=valoracion
    )
    db.session.add(nueva)
    db.session.commit()

    return jsonify({"msg": "Reseña creada"}), 201

# Ver reseñas de un restaurante
@review_bp.route('/restaurante/<int:id>', methods=['GET'])
def ver_resenas(id):
    resenas = Reseña.query.filter_by(restaurante_id=id).all()
    resultado = []
    for r in resenas:
        usuario = Usuario.query.get(r.usuario_id)
        resultado.append({
            "id": r.id,
            "usuario": usuario.nombre,
            "comentario": r.comentario,
            "valoracion": r.valoracion,
            "fecha": r.fecha.strftime('%Y-%m-%d')
        })
    return jsonify(resultado), 200
