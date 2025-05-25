from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from functools import wraps
from models import Usuario

def role_required(roles=[]):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            usuario = Usuario.query.get(user_id)
            if not usuario or usuario.role not in roles:
                return jsonify({"msg": "Acceso denegado"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
