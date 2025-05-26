from app import app
from models import db, Usuario
from flask_bcrypt import generate_password_hash

with app.app_context():
    # Crear usuario del sistema (moderador)
    nombre_sistema = "Sistema"
    email_sistema = "sistema@bites.com"
    existente_sistema = Usuario.query.filter_by(email=email_sistema).first()
    if existente_sistema:
        print("⚠️ El usuario del sistema ya existe.")
    else:
        nuevo = Usuario(
            nombre=nombre_sistema,
            email=email_sistema,
            role="moderador"
        )
        nuevo.password = generate_password_hash("sistema123").decode("utf8")
        db.session.add(nuevo)
        print("✅ Usuario del sistema creado correctamente.")

    # Crear usuario administrador
    nombre_admin = "Administrador"
    email_admin = "admin@bites.com"
    existente_admin = Usuario.query.filter_by(email=email_admin).first()
    if existente_admin:
        print("⚠️ El usuario admin ya existe.")
    else:
        admin = Usuario(
            nombre=nombre_admin,
            email=email_admin,
            role="admin"
        )
        admin.password = generate_password_hash("admin123").decode("utf8")
        db.session.add(admin)
        print("✅ Usuario admin creado correctamente.")

    db.session.commit()
