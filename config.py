class Config:
    SECRET_KEY = "clave-super-secreta"
    SQLALCHEMY_DATABASE_URI = "sqlite:///bites.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "clave-jwt-super-secreta"
