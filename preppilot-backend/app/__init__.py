import os

from flask import Flask, jsonify

from .config import config
from .extensions import cors, db, jwt, migrate


def create_app(config_name=None):
    app = Flask(__name__)

    env_name = config_name or os.getenv("FLASK_ENV", "development")
    app.config.from_object(config[env_name])

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}},
    )

    from .models import Attempt, Conversation, Message, Question, User  # noqa: F401
    from .routes.auth_routes import auth_bp
    from .routes.progress_routes import progress_bp
    from .routes.question_routes import question_bp
    from .routes.profile_routes import profile_bp
    from .routes.chat_routes import chat_bp
    from .routes.profile_routes import profile_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(question_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(chat_bp)

    @app.route("/")
    def index():
        return jsonify({"message": "Welcome to Preppilot API"})

    return app
