from app.models import Question
from app.models import Attempt


def serialize_question(question):
    return {
        "id": question.id,
        "category": question.category,
        "topic": question.topic,
        "company": question.company,
        "difficulty": question.difficulty,
        "question_text": question.question_text,
        "options": question.options,
        "explanation": question.explanation,
    }


def get_questions(category=None, topic=None, company=None, difficulty=None):
    query = Question.query

    if category:
        query = query.filter(Question.category.ilike(category))
    if topic:
        query = query.filter(Question.topic.ilike(topic))
    if company:
        query = query.filter(Question.company.ilike(company))
    if difficulty:
        query = query.filter(Question.difficulty.ilike(difficulty))

    return query.order_by(Question.created_at.desc()).all()


def get_question_by_id(question_id):
    return Question.query.get(question_id)


def serialize_attempt(attempt):
    q = attempt.question
    return {
        "id": attempt.id,
        "question_id": attempt.question_id,
        "question_text": q.question_text if q else None,
        "category": q.category if q else None,
        "topic": q.topic if q else None,
        "company": q.company if q else None,
        "selected_answer": attempt.selected_answer,
        "is_correct": attempt.is_correct,
        "created_at": attempt.created_at.isoformat() if attempt.created_at else None,
    }


def get_attempts_for_user(user_id, limit=100):
    return (
        Attempt.query.filter_by(user_id=user_id)
        .order_by(Attempt.created_at.desc())
        .limit(limit)
        .all()
    )
