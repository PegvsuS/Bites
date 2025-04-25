from flask import Blueprint, request, jsonify
from models import db, Restaurante

restaurant_bp = Blueprint('restaurantes', __name__)

# Crear restaurante
@restaurant_bp.route('/', methods=['POST'])
def crear_restaurante():
    data = request.get_json()
    nuevo = Restaurante(
        nombre=data.get('nombre'),
        tipo_cocina=data.get('tipo_cocina'),
        localidad=data.get('localidad'),
        direccion=data.get('direccion'),
        precio_medio=data.get('precio_medio'),
        imagen=data.get('imagen'),
        url_web=data.get('url_web')
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"msg": "Restaurante creado", "id": nuevo.id}), 201

# Obtener todos
@restaurant_bp.route('/', methods=['GET'])
def obtener_restaurantes():
    restaurantes = Restaurante.query.all()
    resultado = [{
        "id": r.id,
        "nombre": r.nombre,
        "tipo_cocina": r.tipo_cocina,
        "localidad": r.localidad,
        "precio_medio": r.precio_medio,
        "imagen": r.imagen,
        "url_web": r.url_web
    } for r in restaurantes]
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
