import unittest

from flask_jwt_extended import create_access_token

from app import create_app
from app.extensions import db
from app.models import Attempt, Question, User


class AttemptsListingTest(unittest.TestCase):
    def test_list_attempts_for_user(self):
        app = create_app()
        app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI='sqlite://')

        with app.app_context():
            db.drop_all()
            db.create_all()

            user = User(name='Lister', email='lister@example.com', password_hash='placeholder')
            db.session.add(user)
            db.session.commit()

            # create two questions and attempts
            q1 = Question(
                category='DSA',
                topic='Arrays',
                company=None,
                difficulty='Easy',
                question_text='Q1',
                options=['a', 'b'],
                correct_answer='a',
                explanation='ex',
            )
            q2 = Question(
                category='DSA',
                topic='Strings',
                company=None,
                difficulty='Easy',
                question_text='Q2',
                options=['x', 'y'],
                correct_answer='y',
                explanation='ex2',
            )
            db.session.add_all([q1, q2])
            db.session.commit()

            a1 = Attempt(user_id=user.id, question_id=q1.id, selected_answer='a', is_correct=True)
            a2 = Attempt(user_id=user.id, question_id=q2.id, selected_answer='x', is_correct=False)
            db.session.add_all([a1, a2])
            db.session.commit()

            token = create_access_token(identity=str(user.id))
            client = app.test_client()

            response = client.get('/api/attempts', headers={'Authorization': f'Bearer {token}'})

            self.assertEqual(response.status_code, 200)
            data = response.get_json()
            self.assertIsInstance(data, list)
            self.assertEqual(len(data), 2)
            # check keys present
            for item in data:
                self.assertIn('id', item)
                self.assertIn('question_id', item)
                self.assertIn('selected_answer', item)


if __name__ == '__main__':
    unittest.main()
