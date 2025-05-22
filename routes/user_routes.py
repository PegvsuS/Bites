from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Usuario, Resena, Publicacion

user_bp = Blueprint('usuarios', __name__)

@user_bp.route('/perfil', methods=['GET'])
@jwt_required()
def obtener_perfil():
    user_id = get_jwt_identity()
    usuario = Usuario.query.get_or_404(user_id)

    reseñas = Resena.query.filter_by(usuario_id=user_id).all()

    return jsonify({
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "fecha_registro": usuario.fecha_registro.strftime('%Y-%m-%d'),
        "resenas": [
            {
                "id": r.id,
                "restaurante_id": r.restaurante_id,
                "comentario": r.comentario,
                "valoracion": r.valoracion,
                "fecha": r.fecha.strftime('%Y-%m-%d')
            }
            for r in reseñas
        ]
    })

# Buscar usuarios por nombre o email
@user_bp.route('/buscar', methods=['GET'])
@jwt_required()
def buscar_usuarios():
    termino = request.args.get('q', '').strip()
    if not termino:
        return jsonify([])

    resultados = Usuario.query.filter(
        (Usuario.nombre.ilike(f"%{termino}%")) | 
        (Usuario.email.ilike(f"%{termino}%"))
    ).limit(10).all()

    usuarios = [{"id": u.id, "nombre": u.nombre, "email": u.email} for u in resultados]
    return jsonify(usuarios), 200

# Obtener perfil público de un usuario por ID
@user_bp.route('/<int:id>', methods=['GET'])
def perfil_publico(id):
    usuario = Usuario.query.get_or_404(id)

    resenas = Resena.query.filter_by(usuario_id=id).order_by(Resena.fecha.desc()).all()

    return jsonify({
        "id": usuario.id,
        "nombre": usuario.nombre,
        "fecha_registro": usuario.fecha_registro.strftime('%Y-%m-%d'),
        "resenas": [
            {
                "id": r.id,
                "comentario": r.comentario,
                "valoracion": r.valoracion,
                "fecha": r.fecha.strftime('%Y-%m-%d'),
                "restaurante_id": r.restaurante_id
            }
            for r in resenas
        ]
    }), 200

# Obtener publicaciones de un usuario por ID
@user_bp.route('/<int:usuario_id>/publicaciones', methods=['GET'])
def obtener_publicaciones_de_usuario(usuario_id):
    publicaciones = Publicacion.query.filter_by(usuario_id=usuario_id).order_by(Publicacion.fecha.desc()).all()
    return jsonify([p.to_dict() for p in publicaciones]), 200