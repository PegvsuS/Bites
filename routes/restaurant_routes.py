# routes/restaurant_routes.py
import os
from flask import Blueprint, request, jsonify, current_app
from models import db, Restaurante, Resena
from flask_jwt_extended import jwt_required
from sqlalchemy.sql import func
from werkzeug.utils import secure_filename
from utils import allowed_file 

restaurant_bp = Blueprint('restaurantes', __name__)

# Crear restaurante
@restaurant_bp.route('/', methods=['POST'])
@jwt_required()
def crear_restaurante():
    data = request.get_json()
    nuevo = Restaurante(
        nombre=data.get('nombre'),
        tipo_cocina=data.get('tipo_cocina'),
        localidad=data.get('localidad'),
        direccion=data.get('direccion'),
        precio_medio=data.get('precio_medio'),
        imagen=data.get('imagen'),
        url_web=data.get('url_web') or None
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"msg": "Restaurante creado", "id": nuevo.id}), 201

# Ruta de subida de imagenes
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

    query = db.session.query(Restaurante).outerjoin(Resena).group_by(Restaurante.id)

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

    restaurantes = query.all()

    resultado = []
    for r in restaurantes:
        media_valoracion = (
            db.session.query(func.avg(Resena.valoracion))
            .filter(Resena.restaurante_id == r.id)
            .scalar()
        )
        resultado.append({
            "id": r.id,
            "nombre": r.nombre,
            "tipo_cocina": r.tipo_cocina,
            "localidad": r.localidad,
            "precio_medio": r.precio_medio,
            "imagen": r.imagen,
            "url_web": r.url_web,
            "valoracion_media": round(media_valoracion or 0, 1)
        })

    return jsonify(resultado), 200

# Obtener uno por ID
@restaurant_bp.route('/<int:id>', methods=['GET'])
def obtener_restaurante(id):
    r = Restaurante.query.get_or_404(id)
    return jsonify({
        "id": r.id,
        "nombre": r.nombre,
        "tipo_cocina": r.tipo_cocina,
        "localidad": r.localidad,
        "direccion": r.direccion,
        "precio_medio": r.precio_medio,
        "imagen": r.imagen,
        "url_web": r.url_web
    }), 200
