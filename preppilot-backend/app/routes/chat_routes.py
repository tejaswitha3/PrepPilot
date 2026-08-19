from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.ai_service import generate_reply
from app.models import Conversation, Message
from app.extensions import db


chat_bp = Blueprint('chat', __name__, url_prefix='/api')


@chat_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    """Accept a user message, persist conversation/messages, call AI, persist reply.

    Expected JSON: { "message": "...", "conversation_id": <int>? }
    Returns: { "reply": "...", "conversation_id": <int> }
    """
    data = request.get_json(silent=True) or {}
    message = data.get('message')
    conversation_id = data.get('conversation_id')
    if not message or not isinstance(message, str):
        return jsonify({'error': 'message is required'}), 400

    user_id = int(get_jwt_identity())

    # Reuse or create conversation
    if conversation_id:
        conv = Conversation.query.get(conversation_id)
        if not conv:
            return jsonify({'error': 'Conversation not found.'}), 404
        if conv.user_id != user_id:
            return jsonify({'error': 'Forbidden.'}), 403
    else:
        conv = Conversation(user_id=user_id, title=None)
        db.session.add(conv)
        db.session.commit()

    # Persist user message
    user_msg = Message(conversation_id=conv.id, sender='user', content=message)
    db.session.add(user_msg)
    db.session.commit()

    # Call AI
    try:
        reply = generate_reply(user_id, message)
    except Exception as e:
        return jsonify({'error': 'LLM request failed', 'details': str(e)}), 502

    # Persist assistant message
    assistant_msg = Message(conversation_id=conv.id, sender='assistant', content=reply)
    db.session.add(assistant_msg)
    db.session.commit()

    return jsonify({'reply': reply, 'conversation_id': conv.id})


@chat_bp.route('/chat/conversations', methods=['GET'])
@jwt_required()
def list_conversations():
    user_id = int(get_jwt_identity())
    convs = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.created_at.desc()).all()
    results = []
    for c in convs:
        last_msg = c.messages[-1] if c.messages else None
        results.append({
            'id': c.id,
            'title': c.title or (last_msg.content[:60] if last_msg else ''),
            'created_at': c.created_at.isoformat() if c.created_at else None,
            'last_message': last_msg.content if last_msg else None,
            'message_count': len(c.messages),
        })
    return jsonify(results)


@chat_bp.route('/chat/conversations/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation(conversation_id):
    user_id = int(get_jwt_identity())
    conv = Conversation.query.get(conversation_id)
    if not conv:
        return jsonify({'error': 'Conversation not found.'}), 404
    if conv.user_id != user_id:
        return jsonify({'error': 'Forbidden.'}), 403

    msgs = [
        {
            'id': m.id,
            'sender': m.sender,
            'content': m.content,
            'created_at': m.created_at.isoformat() if m.created_at else None,
        }
        for m in sorted(conv.messages, key=lambda x: x.created_at)
    ]

    return jsonify({'id': conv.id, 'title': conv.title, 'messages': msgs})
