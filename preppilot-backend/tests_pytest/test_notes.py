from app.extensions import db
from app.models import Note, User


def create_user_and_token(client, name, email):
    response = client.post(
        '/api/auth/register',
        json={
            'name': name,
            'email': email,
            'password': 'secure123',
            'confirm_password': 'secure123',
        },
    )
    assert response.status_code == 201
    login_response = client.post(
        '/api/auth/login',
        json={'email': email, 'password': 'secure123'},
    )
    return login_response.json['access_token']


def auth(token):
    return {'Authorization': 'Bearer ' + token}


def test_notes_create_list_view_update_and_delete(client, app):
    token = create_user_and_token(client, 'Owner', 'owner@example.com')
    created = client.post(
        '/api/notes',
        headers=auth(token),
        json={'title': 'Arrays', 'content': 'Use two pointers.'},
    )
    assert created.status_code == 201
    note_id = created.json['id']

    assert client.get('/api/notes', headers=auth(token)).json[0]['title'] == 'Arrays'
    assert client.get(f'/api/notes/{note_id}', headers=auth(token)).json['content'] == 'Use two pointers.'

    updated = client.put(
        f'/api/notes/{note_id}',
        headers=auth(token),
        json={'title': 'Array patterns', 'content': 'Two pointers and sliding windows.'},
    )
    assert updated.status_code == 200
    assert updated.json['title'] == 'Array patterns'

    deleted = client.delete(f'/api/notes/{note_id}', headers=auth(token))
    assert deleted.status_code == 200
    assert client.get(f'/api/notes/{note_id}', headers=auth(token)).status_code == 404
    with app.app_context():
        assert Note.query.count() == 0


def test_notes_are_private_for_each_operation(client):
    owner_token = create_user_and_token(client, 'Owner', 'owner2@example.com')
    other_token = create_user_and_token(client, 'Other', 'other2@example.com')
    created = client.post(
        '/api/notes',
        headers=auth(owner_token),
        json={'title': 'Private', 'content': 'Only for the owner.'},
    )
    note_id = created.json['id']

    assert client.get('/api/notes', headers=auth(other_token)).json == []
    assert client.get(f'/api/notes/{note_id}', headers=auth(other_token)).status_code == 404
    assert client.put(
        f'/api/notes/{note_id}',
        headers=auth(other_token),
        json={'title': 'Stolen'},
    ).status_code == 404
    assert client.delete(f'/api/notes/{note_id}', headers=auth(other_token)).status_code == 404
    assert client.get(f'/api/notes/{note_id}', headers=auth(owner_token)).json['title'] == 'Private'


def test_notes_require_auth_and_validate_fields(client):
    assert client.get('/api/notes').status_code == 401
    token = create_user_and_token(client, 'Owner', 'owner3@example.com')
    response = client.post(
        '/api/notes',
        headers=auth(token),
        json={'title': '  ', 'content': 'Text'},
    )
    assert response.status_code == 400
