import unittest

from flask_jwt_extended import create_access_token

from app import create_app
from app.extensions import db
from app.models import Attempt, Question, User


class QuestionAttemptTest(unittest.TestCase):
    def test_submit_question_attempt(self):
        app = create_app()
        app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI='sqlite://')

        with app.app_context():
            db.drop_all()
            db.create_all()

            user = User(name='Tester', email='tester@example.com', password_hash='placeholder')
            db.session.add(user)
            db.session.commit()

            question = Question(
                category='DSA',
                topic='Arrays',
                company=None,
                difficulty='Easy',
                question_text='What is 2 + 2?',
                options=['3', '4', '5', '6'],
                correct_answer='4',
                explanation='Basic arithmetic.',
            )
            db.session.add(question)
            db.session.commit()

            token = create_access_token(identity=str(user.id))
            client = app.test_client()

            response = client.post(
                f'/api/questions/{question.id}/attempt',
                headers={'Authorization': f'Bearer {token}'},
                json={'selected_answer': '4'},
            )

            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json['is_correct'])
            self.assertEqual(response.json['selected_answer'], '4')
            self.assertEqual(Attempt.query.count(), 1)


if __name__ == '__main__':
    unittest.main()
