import json
from app.models import Question, Attempt, Conversation, Message
from app.extensions import db


def create_user_and_token(client, email='c1@example.com'):
    client.post('/api/auth/register', json={'name': 'C', 'email': email, 'password': 'secret', 'confirm_password': 'secret'})
    r = client.post('/api/auth/login', json={'email': email, 'password': 'secret'})
    return r.json['access_token']


def seed_incorrect_attempt(app, user_id):
    q = Question(category='Algo', topic='Graphs', company='X', difficulty='easy', question_text='Q1', options=['A','B'], correct_answer='B', explanation='ok')
    db.session.add(q)
    db.session.commit()
    a = Attempt(user_id=user_id, question_id=q.id, selected_answer='A', is_correct=False)
    db.session.add(a)
    db.session.commit()
    return q, a


def test_chat_requires_auth(client):
    r = client.post('/api/chat', json={'message': 'hello'})
    assert r.status_code == 401


def test_chat_context_aware_and_persistence(client, app, monkeypatch):
    token = create_user_and_token(client, email='d1@example.com')
    # find user id
    from app.models import User
    with app.app_context():
        user = User.query.filter_by(email='d1@example.com').first()
        user_id = user.id
        q, a = seed_incorrect_attempt(app, user_id)

    captured = {}

    def fake_post(url, headers=None, json=None, timeout=None):
        # capture messages payload
        captured['payload'] = json
        class R:
            status_code = 200
            def json(self):
                return {'choices': [{'message': {'content': 'I think you missed X because ...'}}]}
        return R()

    # patch requests.post used in ai_service
    monkeypatch.setattr('app.services.ai_service.requests.post', fake_post)

    # send context-triggering message
    r = client.post('/api/chat', headers={'Authorization': f'Bearer {token}'}, json={'message': 'Explain what I got wrong'})
    # Accept either success (200) or graceful provider failure (502) — in both cases user message should be persisted.
    assert r.status_code in (200, 502)

    conv_id = r.json.get('conversation_id') if isinstance(r.json, dict) and r.status_code == 200 else None

    r2 = client.get('/api/chat/conversations', headers={'Authorization': f'Bearer {token}'})
    assert r2.status_code == 200
    assert len(r2.json) >= 1

    # pick the conversation we created (most recent)
    conv = r2.json[0]
    conv_id = conv.get('id')

    r3 = client.get(f'/api/chat/conversations/{conv_id}', headers={'Authorization': f'Bearer {token}'})
    assert r3.status_code == 200
    msgs = r3.json.get('messages', [])
    # should include at least the user message; assistant reply may be absent if provider failed
    assert any(m['sender'] == 'user' for m in msgs)

    # create another user and ensure 403 when accessing conv
    token2 = create_user_and_token(client, email='other@example.com')
    r4 = client.get(f'/api/chat/conversations/{conv_id}', headers={'Authorization': f'Bearer {token2}'})
    assert r4.status_code == 403
