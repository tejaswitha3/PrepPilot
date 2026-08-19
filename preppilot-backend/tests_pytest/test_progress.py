from app.services.progress_service import get_placeholder_progress


def create_user_and_token(client, email='p1@example.com'):
    client.post('/api/auth/register', json={'name': 'P', 'email': email, 'password': 'secret', 'confirm_password': 'secret'})
    r = client.post('/api/auth/login', json={'email': email, 'password': 'secret'})
    return r.json['access_token']


def test_progress_endpoint_returns_structure(client):
    token = create_user_and_token(client)
    r = client.get('/api/progress', headers={'Authorization': f'Bearer {token}'})
    assert r.status_code == 200
    data = r.json
    assert 'accuracy' in data
    assert 'weak_topics' in data


def test_get_progress_service_direct():
    # progress_service returns a dict with keys we expect
    p = get_placeholder_progress(1)
    assert 'accuracy' in p
    assert isinstance(p['weak_topics'], list)
