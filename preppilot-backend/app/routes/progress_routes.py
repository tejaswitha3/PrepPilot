from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.services.progress_service import (
    get_placeholder_category_progress,
    get_placeholder_progress,
    get_progress_for_user,
)


progress_bp = Blueprint("progress", __name__, url_prefix="/api")


@progress_bp.route("/progress", methods=["GET"])
@jwt_required()
def get_progress():
    user_id = int(get_jwt_identity())
    return jsonify(get_progress_for_user(user_id))


@progress_bp.route("/progress/categories", methods=["GET"])
@jwt_required()
def get_category_progress():
    user_id = int(get_jwt_identity())
    return jsonify(get_placeholder_category_progress(user_id))
