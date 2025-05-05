from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Resena, Usuario, Restaurante

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

    nueva = Resena(
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
    resenas = Resena.query.filter_by(restaurante_id=id).all()
    resultado = []
    for r in resenas:
        usuario = Usuario.query.get(r.usuario_id)
        resultado.append({
            "id": r.id,
            "usuario": usuario.nombre,
            "usuario_id": r.usuario_id,
            "comentario": r.comentario,
            "valoracion": r.valoracion,
            "fecha": r.fecha.strftime('%Y-%m-%d')
        })
    return jsonify(resultado), 200

#Eliminar reseña
@review_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_resena(id):
    resena = Resena.query.get_or_404(id)
    usuario_id = get_jwt_identity()

    if resena.usuario_id != int(usuario_id):
        return jsonify({"msg": "No autorizado para eliminar esta reseña"}), 403

    db.session.delete(resena)
    db.session.commit()

    return jsonify({"msg": "Reseña eliminada exitosamente"}), 200

#Editar reseña
@review_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def editar_resena(id):
    resena = Resena.query.get_or_404(id)
    usuario_id = get_jwt_identity()

    if resena.usuario_id != int(usuario_id):
        return jsonify({"msg": "No autorizado para editar esta reseña"}), 403

    data = request.get_json()
    resena.comentario = data.get('comentario', resena.comentario)
    resena.valoracion = data.get('valoracion', resena.valoracion)
    
    db.session.commit()

    return jsonify({
        "id": resena.id,
        "comentario": resena.comentario,
        "valoracion": resena.valoracion,
        "fecha": resena.fecha.strftime('%Y-%m-%d')
    }), 200

