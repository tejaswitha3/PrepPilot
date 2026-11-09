from app.extensions import db
from app.time_utils import utcnow_naive


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow_naive, nullable=False)

    attempts = db.relationship("Attempt", backref="user", lazy=True, cascade="all, delete-orphan")
    conversations = db.relationship("Conversation", backref="user", lazy=True, cascade="all, delete-orphan")
