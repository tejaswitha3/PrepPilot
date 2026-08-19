from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import User
from app.services.auth_service import serialize_user
from app.services.progress_service import get_placeholder_progress


profile_bp = Blueprint('profile', __name__, url_prefix='/api')


@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    progress = get_placeholder_progress(user_id)
    return jsonify({'user': serialize_user(user), 'progress': progress})


@profile_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json(silent=True) or {}
    name = data.get('name')
    if not name or not isinstance(name, str) or not name.strip():
        return jsonify({'error': 'Valid name is required.'}), 400

    user.name = name.strip()
    db.session.commit()

    progress = get_placeholder_progress(user_id)
    return jsonify({'user': serialize_user(user), 'progress': progress})
