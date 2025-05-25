# seeder.py
from app import app
from models import db, Usuario
from flask_bcrypt import generate_password_hash

with app.app_context():
    nombre_sistema = "Sistema"
    email_sistema = "sistema@bites.com"

    # Verificar si ya existe
    existente = Usuario.query.filter_by(email=email_sistema).first()
    if existente:
        print("⚠️ El usuario del sistema ya existe.")
    else:
        nuevo = Usuario(
            nombre=nombre_sistema,
            email=email_sistema,
            role="system"
        )
        nuevo.password = generate_password_hash("sistema123").decode("utf8")
        db.session.add(nuevo)
        db.session.commit()
        print("✅ Usuario del sistema creado correctamente.")
