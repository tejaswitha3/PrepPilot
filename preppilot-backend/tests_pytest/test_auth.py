import pytest
from app.services.auth_service import get_user_by_email


def register(client, name, email, password, confirm=None):
    return client.post('/api/auth/register', json={'name': name, 'email': email, 'password': password, 'confirm_password': confirm or password})


def login(client, email, password):
    return client.post('/api/auth/login', json={'email': email, 'password': password})


def test_register_and_login_success(client):
    r = register(client, 'Alice', 'alice@example.com', 'secret123')
    assert r.status_code == 201
    assert 'email' in r.json

    r2 = login(client, 'alice@example.com', 'secret123')
    assert r2.status_code == 200
    assert 'access_token' in r2.json


def test_duplicate_email_registration(client):
    r = register(client, 'Bob', 'bob@example.com', 'password1')
    assert r.status_code == 201

    r2 = register(client, 'Bob2', 'bob@example.com', 'password1')
    assert r2.status_code in (400, 409)


def test_registration_rejects_invalid_email(client):
    response = register(client, 'Invalid', 'not-an-email', 'password1')
    assert response.status_code == 400
    assert 'valid email' in response.json['error'].lower()


def test_password_hashing_and_login_failure(client, app):
    register(client, 'Carol', 'carol@example.com', 'mypwd123')
    # Ensure stored password hash does not equal plaintext
    user = get_user_by_email('carol@example.com')
    assert user.password_hash != 'mypwd123'

    # Wrong password fails
    r = login(client, 'carol@example.com', 'wrong')
    assert r.status_code == 401


def test_jwt_required_protected_endpoint(client):
    # protected endpoint: /api/progress
    r = client.get('/api/progress')
    assert r.status_code == 401


def test_login_rejects_invalid_email_and_unknown_account(client):
    invalid_email = login(client, 'not-an-email', 'password1')
    unknown_account = login(client, 'unknown@example.com', 'password1')
    assert invalid_email.status_code == 400
    assert unknown_account.status_code == 401


def test_login_token_can_access_current_user(client):
    register(client, 'Dana', 'dana@example.com', 'password1')
    response = login(client, 'dana@example.com', 'password1')
    current_user = client.get(
        '/api/auth/me',
        headers={'Authorization': 'Bearer ' + response.json['access_token']},
    )
    assert response.status_code == 200
    assert current_user.status_code == 200
    assert current_user.json['email'] == 'dana@example.com'
