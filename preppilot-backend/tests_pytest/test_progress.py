from app.models import Attempt, Question, User
from app.services.progress_service import get_progress_for_user
from app.extensions import db


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


def test_progress_uses_only_users_saved_attempts(client, app):
    first_token = create_user_and_token(client, 'first@example.com')
    second_token = create_user_and_token(client, 'second@example.com')
    with app.app_context():
        first_user = User.query.filter_by(email='first@example.com').first()
        question = Question(
            category='DSA',
            topic='Arrays',
            difficulty='Easy',
            question_text='Question',
            options=['A', 'B'],
            correct_answer='A',
            explanation='Explanation',
        )
        db.session.add(question)
        db.session.flush()
        db.session.add_all([
            Attempt(user_id=first_user.id, question_id=question.id, selected_answer='A', is_correct=True),
            Attempt(user_id=first_user.id, question_id=question.id, selected_answer='B', is_correct=False),
        ])
        db.session.commit()

    first_progress = client.get('/api/progress', headers={'Authorization': 'Bearer ' + first_token}).json
    second_progress = client.get('/api/progress', headers={'Authorization': 'Bearer ' + second_token}).json
    first_categories = client.get('/api/progress/categories', headers={'Authorization': 'Bearer ' + first_token}).json

    assert first_progress == {
        'attempted': 2,
        'solved': 1,
        'accuracy': 50,
        'weak_topics': [{'topic': 'Arrays', 'score': 50}],
        'categories': {'DSA': {'attempted': 2, 'solved': 1, 'accuracy': 50}},
    }
    assert second_progress['attempted'] == 0
    assert second_progress['categories'] == {}
    assert first_categories == first_progress['categories']
