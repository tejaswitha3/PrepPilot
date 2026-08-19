def get_placeholder_progress(user_id):
    return {
        "attempted": 18,
        "solved": 12,
        "accuracy": 67,
        "weak_topics": [
            {"topic": "Dynamic Programming", "score": 45},
            {"topic": "Operating Systems", "score": 52},
            {"topic": "DBMS", "score": 58},
        ],
    }


def get_placeholder_category_progress(user_id):
    return {
        "DSA": {
            "attempted": 9,
            "solved": 6,
            "accuracy": 67,
        },
        "Aptitude": {
            "attempted": 4,
            "solved": 3,
            "accuracy": 75,
        },
        "Technical": {
            "attempted": 3,
            "solved": 2,
            "accuracy": 67,
        },
        "Interview": {
            "attempted": 2,
            "solved": 1,
            "accuracy": 50,
        },
    }


def get_progress_for_user(user_id):
    """Compute simple progress metrics from Attempt rows for the user.

    Returns zeros for users with no attempts.
    """
    from app.models import Attempt

    attempts = Attempt.query.filter_by(user_id=user_id).all()
    if not attempts:
        return {
            "attempted": 0,
            "solved": 0,
            "accuracy": 0,
            "weak_topics": [],
        }

    attempted = len(attempts)
    solved = sum(1 for a in attempts if a.is_correct)
    accuracy = int((solved / attempted) * 100) if attempted else 0

    # naive weak topics: count incorrect by topic
    from collections import Counter
    from app.models import Question

    topic_counter = Counter()
    for a in attempts:
        if not a.is_correct and a.question:
            topic_counter[a.question.topic] += 1

    weak_topics = [
        {"topic": t or "Unknown", "score": int(100 - (count / attempted) * 100)}
        for t, count in topic_counter.most_common(5)
    ]

    return {
        "attempted": attempted,
        "solved": solved,
        "accuracy": accuracy,
        "weak_topics": weak_topics,
    }
