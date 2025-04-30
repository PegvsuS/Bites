from flask import Blueprint, request, jsonify
from models import db, Restaurante
from flask_jwt_extended import jwt_required

restaurant_bp = Blueprint('restaurantes', __name__)

# Crear restaurante
@restaurant_bp.route('/', methods=['POST'])
@jwt_required() # Asegurar que el usuario está autenticado
def crear_restaurante():
    data = request.get_json()
    nuevo = Restaurante(
        nombre=data.get('nombre'),
        tipo_cocina=data.get('tipo_cocina'),
        localidad=data.get('localidad'),
        direccion=data.get('direccion'),
        precio_medio=data.get('precio_medio'),
        imagen=data.get('imagen'),
        url_web=data.get('url_web') or None # url_web puede ser None si no se proporciona
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"msg": "Restaurante creado", "id": nuevo.id}), 201

# Obtener todos
@restaurant_bp.route('/', methods=['GET'])
def obtener_restaurantes():
    localidad = request.args.get('localidad')
    tipo_cocina = request.args.get('tipo_cocina')
    precio_min_raw = request.args.get('precio_min')
    precio_max_raw = request.args.get('precio_max')

# Convertir a float solo si es válido
    try:
        precio_min = float(precio_min_raw)
    except (TypeError, ValueError):
        precio_min = None
    try:
        precio_max = float(precio_max_raw)
    except (TypeError, ValueError):
        precio_max = None

    query = Restaurante.query
    if localidad:
        query = query.filter(Restaurante.localidad.ilike(f"%{localidad}%"))
    if tipo_cocina:
        query = query.filter(Restaurante.tipo_cocina.ilike(f"%{tipo_cocina}%"))
    if precio_min not in [None, ""]:
        try:
            query = query.filter(Restaurante.precio_medio >= float(precio_min))
        except ValueError:
            pass
    if precio_max not in [None, ""]:
        try:
            query = query.filter(Restaurante.precio_medio <= float(precio_max))
        except ValueError:
            pass

    print("→ Filtro precio_min aplicado:", precio_min)
    print("→ Filtro precio_max aplicado:", precio_max)
    print("→ Query final:", str(query))


    restaurantes = query.all()
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
