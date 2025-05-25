import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, MediaPublicacion, Publicacion
from datetime import datetime
from utils import allowed_file

publication_bp = Blueprint('publicaciones', __name__)

@publication_bp.route('/upload', methods=['POST'])
@jwt_required()
def subir_media():
    if 'archivo' not in request.files:
        return jsonify({"msg": "No se envió ningún archivo"}), 400

    archivo = request.files['archivo']
    if archivo.filename == '':
        return jsonify({"msg": "Nombre de archivo vacío"}), 400

    if allowed_file(archivo.filename):
        filename = secure_filename(archivo.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        archivo.save(filepath)

        ext = filename.rsplit('.', 1)[1].lower()
        tipo = "imagen" if ext in ['jpg', 'jpeg', 'png', 'gif', 'webp'] else "video"

        return jsonify({
            "url": f"/static/uploads/{filename}",
            "tipo": tipo
        }), 200

    return jsonify({"msg": "Tipo de archivo no permitido"}), 400

@publication_bp.route('/', methods=['POST'])
@jwt_required()
def crear_publicacion():
    usuario_id = get_jwt_identity()
    contenido = request.form.get("contenido", "").strip()
    archivos = request.files.getlist("media")

    # Validación 1: contenido vacío y sin archivos
    if not contenido and not archivos:
        return jsonify({"msg": "La publicación no puede estar vacía"}), 400

    # Validación 2: número máximo de archivos
    if len(archivos) > 10:
        return jsonify({"msg": "Máximo 10 archivos por publicación"}), 400

    # Crear publicación
    publicacion = Publicacion(usuario_id=usuario_id, contenido=contenido, fecha=datetime.utcnow())
    db.session.add(publicacion)
    db.session.commit()  # Para obtener el ID

    extensiones_validas = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi']

    for archivo in archivos:
        if not archivo or archivo.filename == "":
            continue

        ext = archivo.filename.rsplit('.', 1)[-1].lower()
        if ext not in extensiones_validas:
            continue  # Ignorar archivo no permitido

        filename = secure_filename(archivo.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        archivo.save(filepath)

        tipo = "video" if ext in ['mp4', 'mov', 'avi'] else "imagen"

        media = MediaPublicacion(
            publicacion_id=publicacion.id,
            url=f"/static/uploads/{filename}",
            tipo=tipo
        )
        db.session.add(media)

    db.session.commit()

    return jsonify({
        "msg": "Publicación creada",
        "id": publicacion.id
    }), 201

@publication_bp.route("/mias", methods=["GET"])
@jwt_required()
def publicaciones_mias():
    user_id = get_jwt_identity()
    publicaciones = Publicacion.query.filter_by(usuario_id=user_id).order_by(Publicacion.fecha.desc()).all()
    return jsonify([p.to_dict() for p in publicaciones]), 200


#Editar publicación
@publication_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def editar_publicacion(id):
    user_id = int(get_jwt_identity())
    publicacion = Publicacion.query.get_or_404(id)

    
    if publicacion.usuario_id != user_id:
        return jsonify({"msg": "No tienes permiso para editar esta publicación"}), 403

    data = request.form
    contenido = data.get("contenido", "").strip()
    if contenido:
        publicacion.contenido = contenido

    # 1. Obtener media a eliminar
    ids_a_eliminar = request.form.getlist("media_eliminada")

    # 2. Obtener media actual (para validar el total después)
    media_actual = MediaPublicacion.query.filter_by(publicacion_id=publicacion.id).all()
    media_restante = [m for m in media_actual if str(m.id) not in ids_a_eliminar]
    cantidad_restante = len(media_restante)

    # 3. Obtener nuevos archivos
    archivos = request.files.getlist("media")
    cantidad_nuevos = len([a for a in archivos if a and a.filename != ""])

    # 4. Validar máximo de 10 archivos
    if cantidad_restante + cantidad_nuevos > 10:
        return jsonify({"msg": "Máximo 10 archivos por publicación"}), 400

    # 5. Eliminar media marcada
    for media_id in ids_a_eliminar:
        media = MediaPublicacion.query.filter_by(id=media_id, publicacion_id=publicacion.id).first()
        if media:
            filepath = os.path.join(current_app.root_path, media.url.lstrip('/'))
            if os.path.exists(filepath):
                os.remove(filepath)
            db.session.delete(media)

    # 6. Guardar nuevos archivos
    extensiones_validas = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi']
    for archivo in archivos:
        if not archivo or archivo.filename == "":
            continue

        ext = archivo.filename.rsplit('.', 1)[-1].lower()
        if ext not in extensiones_validas:
            continue

        filename = secure_filename(archivo.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        archivo.save(filepath)

        tipo = "video" if ext in ['mp4', 'mov', 'avi'] else "imagen"

        media = MediaPublicacion(
            publicacion_id=publicacion.id,
            url=f"/static/uploads/{filename}",
            tipo=tipo
        )
        db.session.add(media)
    
    db.session.commit()
    return jsonify({"msg": "Publicación actualizada"}), 200


#Eliminar publicación
@publication_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_publicacion(id):
    user_id = get_jwt_identity()
    publicacion = Publicacion.query.get_or_404(id)

    if publicacion.usuario_id != user_id:
        return jsonify({"msg": "No tienes permiso para eliminar esta publicación"}), 403

    db.session.delete(publicacion)
    db.session.commit()
    return jsonify({"msg": "Publicación eliminada"}), 200

# Obtener una publicación específica
@publication_bp.route('/<int:id>', methods=['GET'])
def obtener_publicacion(id):
    publicacion = Publicacion.query.get_or_404(id)
    return jsonify(publicacion.to_dict()), 200



