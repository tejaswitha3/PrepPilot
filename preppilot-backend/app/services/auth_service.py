from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models import User


def hash_password(password):
    return generate_password_hash(password)


def verify_password(password, password_hash):
    return check_password_hash(password_hash, password)


def get_user_by_email(email):
    return User.query.filter_by(email=email.lower().strip()).first()


def register_user(name, email, password):
    normalized_email = email.lower().strip()

    if User.query.filter_by(email=normalized_email).first():
        raise ValueError("Email already registered.")

    user = User(
        name=name.strip(),
        email=normalized_email,
        password_hash=hash_password(password),
    )
    db.session.add(user)
    db.session.commit()
    return user


def login_user(email, password):
    user = get_user_by_email(email)
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password.")

    token = create_access_token(identity=str(user.id))
    return token, user


def serialize_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
