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

    if not contenido and not archivos:
        return jsonify({"msg": "La publicación no puede estar vacía"}), 400

    publicacion = Publicacion(usuario_id=usuario_id, contenido=contenido, fecha=datetime.utcnow())
    db.session.add(publicacion)
    db.session.commit()  # Para obtener el ID

    for archivo in archivos:
        if archivo and archivo.filename != "":
            filename = secure_filename(archivo.filename)
            ext = filename.rsplit('.', 1)[-1].lower()

            if ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi']:
                continue  # Ignorar archivo no válido

            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            archivo.save(filepath)

            tipo = "video" if ext in ['mp4', 'mov', 'avi'] else "imagen"

            media = MediaPublicacion(
                publicacion_id=publicacion.id,
                archivo=f"/static/uploads/{filename}",
                tipo=tipo
            )
            db.session.add(media)

    db.session.commit()

    return jsonify({"msg": "Publicación creada", "id": publicacion.id}), 201
