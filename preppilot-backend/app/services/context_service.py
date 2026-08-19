import re
from typing import Optional, Dict, Any

from app.models import Attempt, Question
from app.extensions import db
from app.services.progress_service import get_placeholder_progress


EXPLAIN_PATTERNS = [
    r"explain (what )?i (got )?wrong",
    r"why (was|am) i wrong",
    r"what did i get wrong",
    r"why did i get it wrong",
]

STUDY_PATTERNS = [
    r"what should i study",
    r"what should i learn",
    r"what to study next",
    r"study next",
    r"what should i study next",
]


def _matches_any(text: str, patterns) -> bool:
    t = text.lower()
    return any(re.search(p, t) for p in patterns)


def analyze_message_for_context(text: str) -> str:
    """Return one of: 'explain_attempt', 'study_suggestions', 'none'"""
    if _matches_any(text, EXPLAIN_PATTERNS):
        return 'explain_attempt'
    if _matches_any(text, STUDY_PATTERNS):
        return 'study_suggestions'
    return 'none'


def get_last_incorrect_attempt_with_question(user_id: int) -> Optional[Dict[str, Any]]:
    """Return the most recent incorrect attempt for user with question details, or None."""
    # Query attempts joined with question, most recent incorrect
    attempt = (
        db.session.query(Attempt)
        .filter(Attempt.user_id == user_id, Attempt.is_correct == False)
        .order_by(Attempt.created_at.desc())
        .first()
    )
    if not attempt:
        return None

    question = Question.query.get(attempt.question_id)
    if not question:
        return None

    return {
        'attempt': {
            'id': attempt.id,
            'selected_answer': attempt.selected_answer,
            'is_correct': attempt.is_correct,
            'created_at': attempt.created_at.isoformat() if attempt.created_at else None,
        },
        'question': {
            'id': question.id,
            'question_text': question.question_text,
            'options': question.options,
            'correct_answer': question.correct_answer,
            'explanation': question.explanation,
        },
    }


def get_study_suggestions_context(user_id: int) -> Dict[str, Any]:
    """Return aggregated weak-topic stats for the user (placeholder service)."""
    return get_placeholder_progress(user_id)
