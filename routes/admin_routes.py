from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models import db, Usuario
from decorators import role_required  # <- lo importas aquí

admin_bp = Blueprint("admin", __name__)

@admin_bp.route('/usuarios', methods=['GET'])
@jwt_required()
@role_required(["admin"])
def listar_usuarios():
    usuarios = Usuario.query.all()
    resultado = [
        {
            "id": u.id,
            "nombre": u.nombre,
            "email": u.email,
            "role": u.role,
            "fecha_registro": u.fecha_registro.strftime("%Y-%m-%d %H:%M:%S")
        }
        for u in usuarios
    ]
    return jsonify(resultado), 200

@admin_bp.route('/usuarios/<int:usuario_id>/rol', methods=['PUT'])
@jwt_required()
@role_required(["admin"])
def actualizar_rol(usuario_id):
    data = request.get_json()
    nuevo_rol = data.get("rol")

    if nuevo_rol not in ["user", "moderador", "admin"]:
        return jsonify({"msg": "Rol inválido"}), 400

    usuario = Usuario.query.get_or_404(usuario_id)
    usuario.role = nuevo_rol
    db.session.commit()

    return jsonify({"msg": "Rol actualizado correctamente"})

@admin_bp.route('/usuarios/<int:usuario_id>', methods=['DELETE'])
@jwt_required()
@role_required(["admin"])
def eliminar_usuario(usuario_id):
    usuario = Usuario.query.get_or_404(usuario_id)

    if usuario.role == "admin":
        return jsonify({"msg": "No puedes eliminar a otro administrador"}), 403

    db.session.delete(usuario)
    db.session.commit()

    return jsonify({"msg": "Usuario eliminado correctamente"})
