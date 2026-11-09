from app.extensions import db
from app.time_utils import utcnow_naive


class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow_naive, nullable=False)

    messages = db.relationship("Message", backref="conversation", lazy=True, cascade="all, delete-orphan")
