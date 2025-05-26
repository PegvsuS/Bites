from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Notificacion

notification_bp = Blueprint('notificaciones', __name__)

# Listar notificaciones del usuario autenticado
@notification_bp.route('/', methods=['GET'])
@jwt_required()
def obtener_notificaciones():
    user_id = get_jwt_identity()
    notificaciones = Notificacion.query.filter_by(usuario_id=user_id).order_by(Notificacion.fecha.desc()).all()
    return jsonify([
        {
            "id": n.id,
            "mensaje": n.mensaje,
            "leida": n.leida,
            "fecha": n.fecha.strftime('%Y-%m-%d %H:%M:%S')
        } for n in notificaciones
    ])

# Marcar una notificación como leída
@notification_bp.route('/<int:id>/leida', methods=['PUT'])
@jwt_required()
def marcar_como_leida(id):
    user_id = get_jwt_identity()
    notificacion = Notificacion.query.get_or_404(id)

    if notificacion.usuario_id != user_id:
        return jsonify({"msg": "No autorizado"}), 403

    notificacion.leida = True
    db.session.commit()
    return jsonify({"msg": "Notificación marcada como leída"})

# Crear notificación manual (útil para pruebas o futuros disparos)
@notification_bp.route('/', methods=['POST'])
@jwt_required()
def crear_notificacion():
    data = request.get_json()
    mensaje = data.get("mensaje", "").strip()
    usuario_id = data.get("usuario_id")

    if not mensaje or not usuario_id:
        return jsonify({"msg": "Faltan datos"}), 400

    noti = Notificacion(mensaje=mensaje, usuario_id=usuario_id)
    db.session.add(noti)
    db.session.commit()

    return jsonify({"msg": "Notificación creada"}), 201
