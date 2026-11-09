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
    assert 'explanation' not in data[0]


def test_get_questions_filters_by_category_and_topic(client, app):
    with app.app_context():
        matching = Question(
            category='DSA',
            topic='Arrays',
            difficulty='Easy',
            question_text='Array question',
            options=['A', 'B'],
            correct_answer='A',
            explanation='Array explanation',
        )
        different_topic = Question(
            category='DSA',
            topic='Trees',
            difficulty='Easy',
            question_text='Tree question',
            options=['A', 'B'],
            correct_answer='A',
            explanation='Tree explanation',
        )
        different_category = Question(
            category='Technical',
            topic='Arrays',
            difficulty='Easy',
            question_text='Technical array question',
            options=['A', 'B'],
            correct_answer='A',
            explanation='Technical array explanation',
        )
        db.session.add_all([matching, different_topic, different_category])
        db.session.commit()

    token = create_user_and_token(client)
    response = client.get(
        '/api/questions?category=dsa&topic=arrays',
        headers={'Authorization': 'Bearer ' + token},
    )

    assert response.status_code == 200
    assert [question['question_text'] for question in response.json] == ['Array question']


def test_preparation_topics_expose_filters_for_stored_question_values(client):
    token = create_user_and_token(client)
    response = client.get(
        '/api/preparation',
        headers={'Authorization': 'Bearer ' + token},
    )

    assert response.status_code == 200
    categories = {category['id']: category for category in response.json['categories']}
    assert categories['dsa']['question_category'] == 'DSA'
    quantitative = next(topic for topic in categories['aptitude']['topics'] if topic['id'] == 'quant')
    assert quantitative['question_topic'] == 'Percentages'
    amazon = next(topic for topic in categories['company']['topics'] if topic['id'] == 'amazon-demo')
    assert (amazon['question_category'], amazon['question_topic'], amazon['company']) == (
        'DSA',
        'Graphs',
        'Amazon',
    )


def test_submit_attempt_and_persistence(client, app):
    with app.app_context():
        q = seed_question(app)
        q_id = q.id

    token = create_user_and_token(client)
    r = client.post(f'/api/questions/{q_id}/attempt', headers={'Authorization': f'Bearer {token}'}, json={'selected_answer': 'A'})
    assert r.status_code == 200
    assert 'is_correct' in r.json
    assert r.json['correct_answer'] == 'A'
    assert r.json['explanation'] == 'explain'

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
    own_attempt = first_results.json[0]
    assert own_attempt['question_text'] == 'What is DP?'
    assert own_attempt['selected_answer'] == 'A'
    assert own_attempt['correct_answer'] == 'A'
    assert own_attempt['explanation'] == 'explain'


def test_attempt_results_report_missing_explanation_as_unavailable(client, app):
    with app.app_context():
        question = Question(
            category='Algorithms',
            topic='DP',
            difficulty='medium',
            question_text='Legacy question without explanation',
            options=['A', 'B'],
            correct_answer='B',
            explanation='',
        )
        db.session.add(question)
        db.session.commit()
        question_id = question.id

    token = create_user_and_token(client, 'legacy-attempt@example.com')
    submitted = client.post(
        f'/api/questions/{question_id}/attempt',
        headers={'Authorization': 'Bearer ' + token},
        json={'selected_answer': 'A'},
    )
    response = client.get(
        '/api/attempts',
        headers={'Authorization': 'Bearer ' + token},
    )

    assert submitted.status_code == 200
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]['correct_answer'] == 'B'
    assert response.json[0]['explanation'] is None


def test_attempts_endpoint_requires_authentication(client):
    response = client.get('/api/attempts')

    assert response.status_code in (401, 422)


def test_attempt_submission_rejects_non_object_json(client, app):
    with app.app_context():
        question = seed_question(app)
        question_id = question.id
    token = create_user_and_token(client, 'bad-attempt@example.com')

    response = client.post(
        f'/api/questions/{question_id}/attempt',
        headers={'Authorization': 'Bearer ' + token},
        json=['not', 'an', 'object'],
    )

    assert response.status_code == 400


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

    assert all(
        len(item['options']) == 4
        and len(set(item['options'])) == 4
        and item['correct_answer'] in item['options']
        and item['explanation'].strip()
        for item in seed_questions.QUESTION_DATA
    )

    seed_questions.seed_questions()
    with app.app_context():
        after_first_seed = Question.query.count()
    seed_questions.seed_questions()
    with app.app_context():
        after_second_seed = Question.query.count()

    assert after_first_seed == before + len(seed_questions.QUESTION_DATA)
    assert after_second_seed == after_first_seed
    with app.app_context():
        for item in seed_questions.QUESTION_DATA:
            assert Question.query.filter_by(
                category=item['category'],
                topic=item['topic'],
                company=item['company'],
                question_text=item['question_text'],
            ).count() == 1


def test_seeded_questions_cover_preparation_topic_and_company_filters(client, app, monkeypatch):
    from app.seed import seed_questions

    monkeypatch.setattr(seed_questions, 'create_app', lambda: app)
    seed_questions.seed_questions()
    token = create_user_and_token(client, 'topic-coverage@example.com')
    headers = {'Authorization': 'Bearer ' + token}
    preparation = client.get('/api/preparation', headers=headers)
    assert preparation.status_code == 200

    for category in preparation.json['categories']:
        category_filter = category.get('question_category', category['name'])
        for topic in category['topics']:
            filters = {
                'category': topic.get('question_category', category_filter),
                'topic': topic.get('question_topic', topic['name']),
            }
            if topic.get('company'):
                filters['company'] = topic['company']

            response = client.get('/api/questions', query_string=filters, headers=headers)

            assert response.status_code == 200, filters
            assert len(response.json) >= 2, f"Fewer than two starter questions returned for preparation topic: {filters}"
            assert all(question['category'].casefold() == filters['category'].casefold() for question in response.json)
            assert all(question['topic'].casefold() == filters['topic'].casefold() for question in response.json)
            if 'company' in filters:
                assert all(question['company'] == filters['company'] for question in response.json)
