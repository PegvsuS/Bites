import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.sql import func
from werkzeug.utils import secure_filename
from models import db, Restaurante, Resena
from utils import allowed_file

restaurant_bp = Blueprint('restaurantes', __name__)

# Crear restaurante
@restaurant_bp.route('/', methods=['POST'])
@jwt_required()
def crear_restaurante():
    user_id = get_jwt_identity()
    data = request.get_json()
    nuevo = Restaurante(
        nombre=data.get('nombre'),
        tipo_cocina=data.get('tipo_cocina'),
        localidad=data.get('localidad'),
        direccion=data.get('direccion'),
        precio_medio=data.get('precio_medio'),
        imagen=data.get('imagen'),
        url_web=data.get('url_web') or None,
        creador_id=user_id  # ✅ Asignar creador
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"msg": "Restaurante creado", "id": nuevo.id}), 201

# Subir imagen
@restaurant_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    if 'imagen' not in request.files:
        return jsonify({"msg": "No se envió ningún archivo"}), 400

    file = request.files['imagen']
    if file.filename == '':
        return jsonify({"msg": "Nombre de archivo vacío"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({"url": f"/static/uploads/{filename}"}), 200

    return jsonify({"msg": "Archivo no permitido"}), 400

# Obtener todos los restaurantes
@restaurant_bp.route('/', methods=['GET'])
def obtener_restaurantes():
    localidad = request.args.get('localidad')
    tipo_cocina = request.args.get('tipo_cocina')
    precio_min_raw = request.args.get('precio_min')
    precio_max_raw = request.args.get('precio_max')
    valoracion_min_raw = request.args.get('valoracion_min')
    ordenar_por = request.args.get('ordenar_por')

    try:
        precio_min = float(precio_min_raw)
    except (TypeError, ValueError):
        precio_min = None
    try:
        precio_max = float(precio_max_raw)
    except (TypeError, ValueError):
        precio_max = None
    try:
        valoracion_min = float(valoracion_min_raw)
    except (TypeError, ValueError):
        valoracion_min = None

    query = db.session.query(Restaurante, func.avg(Resena.valoracion).label("media_valoracion")) \
        .outerjoin(Resena).group_by(Restaurante.id)

    if localidad:
        query = query.filter(Restaurante.localidad.ilike(f"%{localidad}%"))
    if tipo_cocina:
        query = query.filter(Restaurante.tipo_cocina.ilike(f"%{tipo_cocina}%"))
    if precio_min is not None:
        query = query.filter(Restaurante.precio_medio >= precio_min)
    if precio_max is not None:
        query = query.filter(Restaurante.precio_medio <= precio_max)
    if valoracion_min is not None:
        query = query.having(func.avg(Resena.valoracion) >= valoracion_min)

    if ordenar_por == "fecha_asc":
        query = query.order_by(Restaurante.fecha_registro.asc())
    elif ordenar_por == "fecha_desc":
        query = query.order_by(Restaurante.fecha_registro.desc())
    elif ordenar_por == "valoracion_asc":
        query = query.order_by(func.avg(Resena.valoracion).asc())
    elif ordenar_por == "valoracion_desc":
        query = query.order_by(func.avg(Resena.valoracion).desc())

    resultados = query.all()

    lista = []
    for r, media in resultados:
        cantidad_resenas = db.session.query(func.count(Resena.id)) \
            .filter(Resena.restaurante_id == r.id).scalar()
        lista.append({
            "id": r.id,
            "nombre": r.nombre,
            "tipo_cocina": r.tipo_cocina,
            "localidad": r.localidad,
            "precio_medio": r.precio_medio,
            "imagen": r.imagen,
            "url_web": r.url_web,
            "valoracion_media": round(media or 0, 1),
            "cantidad_resenas": cantidad_resenas
        })

    return jsonify(lista), 200

# Obtener restaurante por ID
@restaurant_bp.route('/<int:id>', methods=['GET'])
@jwt_required(optional=True)
def obtener_restaurante(id):
    r = Restaurante.query.get_or_404(id)
    user_id = get_jwt_identity()

    return jsonify({
        "id": r.id,
        "nombre": r.nombre,
        "tipo_cocina": r.tipo_cocina,
        "localidad": r.localidad,
        "direccion": r.direccion,
        "precio_medio": r.precio_medio,
        "imagen": r.imagen,
        "url_web": r.url_web,
        "creador_id": r.creador_id  # Para editar solo si es suyo
    }), 200

# Editar restaurante (solo creador)
@restaurant_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def editar_restaurante(id):
    r = Restaurante.query.get_or_404(id)
    user_id = get_jwt_identity()

    if r.creador_id != user_id:
        return jsonify({"msg": "No tienes permiso para editar este restaurante"}), 403

    data = request.get_json()
    r.nombre = data.get('nombre', r.nombre)
    r.tipo_cocina = data.get('tipo_cocina', r.tipo_cocina)
    r.localidad = data.get('localidad', r.localidad)
    r.direccion = data.get('direccion', r.direccion)
    r.precio_medio = data.get('precio_medio', r.precio_medio)
    r.imagen = data.get('imagen', r.imagen)
    r.url_web = data.get('url_web', r.url_web)

    db.session.commit()
    return jsonify({"msg": "Restaurante actualizado"}), 200

# Eliminar restaurante (solo creador)
@restaurant_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_restaurante(id):
    r = Restaurante.query.get_or_404(id)
    user_id = get_jwt_identity()

    if r.creador_id != int(user_id):
        return jsonify({"msg": "No tienes permiso para eliminar este restaurante"}), 403

    db.session.delete(r)
    db.session.commit()
    return jsonify({"msg": "Restaurante eliminado"}), 200
