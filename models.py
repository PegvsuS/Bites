from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import datetime

# Aquí inicializamos la instancia de SQLAlchemy
db = SQLAlchemy()

# Modelo Usuario
class Usuario(db.Model):
    __tablename__ = "usuario"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    notificaciones = db.relationship('Notificacion', backref='usuario', lazy=True, cascade="all, delete-orphan")


    def set_password(self, password):
        self.password = generate_password_hash(password).decode('utf8')

    def check_password(self, password):
        return check_password_hash(self.password, password)

# Modelo Restaurante
class Restaurante(db.Model):
    __tablename__ = "restaurante"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo_cocina = db.Column(db.String(50))
    localidad = db.Column(db.String(50))
    direccion = db.Column(db.String(200))
    precio_medio = db.Column(db.Float, nullable=False)
    imagen = db.Column(db.String(200))  # URL o path de la imagen
    url_web = db.Column(db.String(255), nullable=True)  # URL del sitio web
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    creador_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)


# Modelo Reseña
class Resena(db.Model):
    __tablename__ = "resena"
    id = db.Column(db.Integer, primary_key=True)
    comentario = db.Column(db.Text, nullable=False)
    valoracion = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    restaurante_id = db.Column(db.Integer, db.ForeignKey('restaurante.id'), nullable=False)

#Modelo Comentario
class Comentario(db.Model):
    __tablename__ = "comentario"
    id = db.Column(db.Integer, primary_key=True)
    resena_id = db.Column(db.Integer, db.ForeignKey('resena.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    texto = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.relationship('LikeComentario', backref='comentario', cascade="all, delete-orphan")


#Modelo LikeRseña
class LikeResena(db.Model):
    __tablename__ = "like_resena"
    id = db.Column(db.Integer, primary_key=True)
    resena_id = db.Column(db.Integer, db.ForeignKey('resena.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    __table_args__ = (db.UniqueConstraint('resena_id', 'usuario_id', name='_resena_usuario_uc'),)

#Modelo LikeComentario
class LikeComentario(db.Model):
    __tablename__ = "like_comentario"
    id = db.Column(db.Integer, primary_key=True)
    comentario_id = db.Column(db.Integer, db.ForeignKey('comentario.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    __table_args__ = (db.UniqueConstraint('comentario_id', 'usuario_id', name='unique_like_comentario'),)

#Modelo Publicacion
class Publicacion(db.Model):
    __tablename__ = 'publicacion'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    contenido = db.Column(db.Text, nullable=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    restaurante_etiquetado = db.Column(db.String(255), nullable=True)

    media = db.relationship('MediaPublicacion', back_populates='publicacion', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "contenido": self.contenido,
            "fecha": self.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            "restaurante_etiquetado": self.restaurante_etiquetado,
            "media": [m.to_dict() for m in self.media]
        }

#Modelo MediaPublicacion
class MediaPublicacion(db.Model):
    __tablename__ = "media_publicacion"

    id = db.Column(db.Integer, primary_key=True)
    publicacion_id = db.Column(db.Integer, db.ForeignKey("publicacion.id", ondelete="CASCADE"), nullable=False)
    tipo = db.Column(db.String(10), nullable=False)  # "imagen" o "video"
    url = db.Column(db.String(255), nullable=False)

    publicacion = db.relationship('Publicacion', back_populates='media')

    def to_dict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "url": self.url
        }
    
#Modelo Notificacion
class Notificacion(db.Model):
    __tablename__ = "notificacion"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    mensaje = db.Column(db.Text, nullable=False)
    leida = db.Column(db.Boolean, default=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    

