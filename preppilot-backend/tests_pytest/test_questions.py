import pytest
from app.models import Question, Attempt
from app.extensions import db


def create_user_and_token(client, email='u1@example.com'):
    client.post('/api/auth/register', json={'name': 'U', 'email': email, 'password': 'secret', 'confirm_password': 'secret'})
    r = client.post('/api/auth/login', json={'email': email, 'password': 'secret'})
    return r.json['access_token']


def seed_question(app):
    q = Question(category='Algorithms', topic='DP', company='Acme', difficulty='medium', question_text='What is DP?', options=['A','B','C'], correct_answer='A', explanation='explain')
    db.session.add(q)
    db.session.commit()
    return q


def test_get_questions_hides_correct_answer(client, app):
    with app.app_context():
        seed_question(app)

    token = create_user_and_token(client)
    r = client.get('/api/questions', headers={'Authorization': f'Bearer {token}'})
    assert r.status_code == 200
    data = r.json
    assert isinstance(data, list)
    assert 'correct_answer' not in data[0]


def test_submit_attempt_and_persistence(client, app):
    with app.app_context():
        q = seed_question(app)
        q_id = q.id

    token = create_user_and_token(client)
    r = client.post(f'/api/questions/{q_id}/attempt', headers={'Authorization': f'Bearer {token}'}, json={'selected_answer': 'A'})
    assert r.status_code == 200
    assert 'is_correct' in r.json

    # verify attempt stored in DB
    with app.app_context():
        attempts = Attempt.query.all()
        assert len(attempts) == 1
        assert attempts[0].selected_answer == 'A'
