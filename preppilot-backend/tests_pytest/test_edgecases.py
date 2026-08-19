import pytest
from flask_jwt_extended import create_access_token
from datetime import timedelta


def create_user(client, email='edge@example.com'):
    r = client.post('/api/auth/register', json={'name': 'E', 'email': email, 'password': 'pwd123', 'confirm_password': 'pwd123'})
    assert r.status_code == 201
    return email


def login_and_get_token(client, email='edge@example.com'):
    r = client.post('/api/auth/login', json={'email': email, 'password': 'pwd123'})
    assert r.status_code == 200
    return r.json['access_token']


def test_malformed_authorization_header(client):
    # missing Bearer
    r = client.get('/api/progress', headers={'Authorization': 'Token abc'})
    assert r.status_code == 422 or r.status_code == 401


def test_jwt_tampered_signature(client):
    email = create_user(client, 'tamper@example.com')
    token = login_and_get_token(client, email)
    # tamper token by appending an extra character (invalid signature)
    tampered = token + 'a'
    r = client.get('/api/progress', headers={'Authorization': f'Bearer {tampered}'})
    assert r.status_code in (401, 422)


def test_jwt_expired_token(client, app):
    # create an explicitly expired token
    with app.app_context():
        expired = create_access_token(identity='1', expires_delta=timedelta(seconds=-1))
    r = client.get('/api/progress', headers={'Authorization': f'Bearer {expired}'})
    assert r.status_code in (401, 422)


def test_correct_answer_absent_on_questions_endpoints(client, app):
    # seed a question
    from app.models import Question
    from app.extensions import db
    with app.app_context():
        q = Question(category='X', topic='Y', company='Z', difficulty='easy', question_text='Hidden?', options=['A','B'], correct_answer='A', explanation='e')
        db.session.add(q)
        db.session.commit()
        qid = q.id

    email = create_user(client, 'qa@example.com')
    token = login_and_get_token(client, email)

    r1 = client.get('/api/questions', headers={'Authorization': f'Bearer {token}'})
    assert r1.status_code == 200
    assert 'correct_answer' not in r1.json[0]

    r2 = client.get(f'/api/questions/{qid}', headers={'Authorization': f'Bearer {token}'})
    assert r2.status_code == 200
    assert 'correct_answer' not in r2.json


def test_duplicate_email_registration_casing(client):
    r1 = client.post('/api/auth/register', json={'name': 'A', 'email': 'Case@Test.com', 'password': 'password1', 'confirm_password': 'password1'})
    assert r1.status_code == 201
    r2 = client.post('/api/auth/register', json={'name': 'B', 'email': 'case@test.com', 'password': 'password1', 'confirm_password': 'password1'})
    assert r2.status_code in (400, 409)


def test_empty_state_progress_returns_zeros(client):
    email = create_user(client, 'newuser@example.com')
    token = login_and_get_token(client, email)
    r = client.get('/api/progress', headers={'Authorization': f'Bearer {token}'})
    assert r.status_code == 200
    data = r.json
    assert data['attempted'] == 0
    assert data['solved'] == 0
    assert data['accuracy'] == 0


def test_ai_service_failure_modes_timeout_and_429(client, app, monkeypatch):
    # patch requests.post used by ai_service to simulate Timeout and 429
    import requests

    def raise_timeout(url, headers=None, json=None, timeout=None):
        raise requests.exceptions.Timeout('timed out')

    def resp_429(url, headers=None, json=None, timeout=None):
        class R:
            status_code = 429
            text = 'Too Many Requests'
            def json(self):
                return {'error': 'rate_limited'}
        return R()

    # register and login
    email = create_user(client, 'aiuser@example.com')
    token = login_and_get_token(client, email)

    # simulate timeout
    monkeypatch.setattr('app.services.ai_service.requests.post', raise_timeout)
    r = client.post('/api/chat', headers={'Authorization': f'Bearer {token}'}, json={'message': 'Hello'})
    assert r.status_code == 502
    assert 'LLM request failed' in r.json.get('error', '')

    # simulate 429
    monkeypatch.setattr('app.services.ai_service.requests.post', resp_429)
    r2 = client.post('/api/chat', headers={'Authorization': f'Bearer {token}'}, json={'message': 'Hello again'})
    assert r2.status_code == 502
    assert 'LLM request failed' in r2.json.get('error', '')
