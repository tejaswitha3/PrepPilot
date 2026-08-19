from datetime import datetime

from app.extensions import db


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    topic = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=True)
    difficulty = db.Column(db.String(30), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    options = db.Column(db.JSON, nullable=False)
    correct_answer = db.Column(db.String(255), nullable=False)
    explanation = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    attempts = db.relationship("Attempt", backref="question", lazy=True, cascade="all, delete-orphan")
