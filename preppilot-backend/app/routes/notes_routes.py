from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Note


notes_bp = Blueprint("notes", __name__, url_prefix="/api/notes")


def serialize_note(note):
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat(),
    }


def get_owned_note(note_id, user_id):
    return Note.query.filter_by(id=note_id, user_id=user_id).first()


@notes_bp.route("", methods=["GET"])
@jwt_required()
def list_notes():
    user_id = int(get_jwt_identity())
    notes = Note.query.filter_by(user_id=user_id).order_by(Note.updated_at.desc()).all()
    return jsonify([serialize_note(note) for note in notes])


@notes_bp.route("", methods=["POST"])
@jwt_required()
def create_note():
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    content = data.get("content")
    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "A valid title is required."}), 400
    if not isinstance(content, str):
        return jsonify({"error": "Note content is required."}), 400

    note = Note(
        user_id=int(get_jwt_identity()),
        title=title.strip(),
        content=content,
    )
    db.session.add(note)
    db.session.commit()
    return jsonify(serialize_note(note)), 201


@notes_bp.route("/<int:note_id>", methods=["GET"])
@jwt_required()
def get_note(note_id):
    note = get_owned_note(note_id, int(get_jwt_identity()))
    if not note:
        return jsonify({"error": "Note not found."}), 404
    return jsonify(serialize_note(note))


@notes_bp.route("/<int:note_id>", methods=["PUT"])
@jwt_required()
def update_note(note_id):
    note = get_owned_note(note_id, int(get_jwt_identity()))
    if not note:
        return jsonify({"error": "Note not found."}), 404

    data = request.get_json(silent=True) or {}
    title = data.get("title")
    content = data.get("content")
    if title is not None:
        if not isinstance(title, str) or not title.strip():
            return jsonify({"error": "A valid title is required."}), 400
        note.title = title.strip()
    if content is not None:
        if not isinstance(content, str):
            return jsonify({"error": "Note content must be text."}), 400
        note.content = content
    if title is None and content is None:
        return jsonify({"error": "At least one note field must be provided."}), 400

    db.session.commit()
    return jsonify(serialize_note(note))


@notes_bp.route("/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(note_id):
    note = get_owned_note(note_id, int(get_jwt_identity()))
    if not note:
        return jsonify({"error": "Note not found."}), 404
    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "Note deleted."})
