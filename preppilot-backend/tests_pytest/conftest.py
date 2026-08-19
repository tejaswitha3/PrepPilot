import pytest

from app import create_app
from app.extensions import db
import os


@pytest.fixture
def app():
    # Ensure tests don't fail due to missing AI key; use dummy key so ai_service doesn't raise.
    os.environ.setdefault('OPENAI_API_KEY', 'testkey')
    app = create_app()
    app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI='sqlite://')

    with app.app_context():
        db.drop_all()
        db.create_all()
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()
