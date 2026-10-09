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


def test_attempt_results_are_private_to_the_authenticated_user(client, app):
    with app.app_context():
        q = seed_question(app)
        q_id = q.id

    first_token = create_user_and_token(client, 'first-results@example.com')
    second_token = create_user_and_token(client, 'second-results@example.com')
    submitted = client.post(
        f'/api/questions/{q_id}/attempt',
        headers={'Authorization': 'Bearer ' + first_token},
        json={'selected_answer': 'A'},
    )
    first_results = client.get(
        '/api/attempts',
        headers={'Authorization': 'Bearer ' + first_token},
    )
    second_results = client.get(
        '/api/attempts',
        headers={'Authorization': 'Bearer ' + second_token},
    )

    assert submitted.status_code == 200
    assert len(first_results.json) == 1
    assert second_results.json == []


def test_attempt_rejects_an_answer_not_in_the_question_options(client, app):
    with app.app_context():
        q = seed_question(app)
        q_id = q.id

    token = create_user_and_token(client)
    response = client.post(
        f'/api/questions/{q_id}/attempt',
        headers={'Authorization': 'Bearer ' + token},
        json={'selected_answer': 'Not an option'},
    )
    assert response.status_code == 400


def test_question_seeding_preserves_existing_questions_and_is_idempotent(app, monkeypatch):
    from app.seed import seed_questions

    with app.app_context():
        seed_question(app)
        before = Question.query.count()
    monkeypatch.setattr(seed_questions, 'create_app', lambda: app)

    seed_questions.seed_questions()
    with app.app_context():
        after_first_seed = Question.query.count()
    seed_questions.seed_questions()
    with app.app_context():
        after_second_seed = Question.query.count()

    assert after_first_seed >= before
    assert after_second_seed == after_first_seed
