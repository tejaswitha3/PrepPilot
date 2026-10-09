def get_progress_for_user(user_id):
    """Return metrics based on saved attempts belonging to one user.

    Accuracy is the rounded percentage of correct attempts. Topic scores use
    each topic's own attempts as the denominator; only topics with mistakes
    appear in the weak-topic list.
    """
    from collections import defaultdict

    from app.models import Attempt
    from app.models import Question

    attempts = (
        Attempt.query.join(Question, Attempt.question_id == Question.id)
        .filter(Attempt.user_id == user_id)
        .all()
    )
    categories = defaultdict(lambda: {"attempted": 0, "solved": 0})
    topics = defaultdict(lambda: {"attempted": 0, "solved": 0})
    for attempt in attempts:
        question = attempt.question
        category_stats = categories[question.category]
        topic_stats = topics[question.topic]
        category_stats["attempted"] += 1
        topic_stats["attempted"] += 1
        if attempt.is_correct:
            category_stats["solved"] += 1
            topic_stats["solved"] += 1

    attempted = len(attempts)
    solved = sum(1 for attempt in attempts if attempt.is_correct)
    for stats in categories.values():
        stats["accuracy"] = round(stats["solved"] * 100 / stats["attempted"])
    weak_topics = [
        {
            "topic": topic,
            "score": round(stats["solved"] * 100 / stats["attempted"]),
        }
        for topic, stats in sorted(
            topics.items(),
            key=lambda item: (item[1]["solved"] / item[1]["attempted"], item[0]),
        )
        if stats["solved"] < stats["attempted"]
    ][:5]

    return {
        "attempted": attempted,
        "solved": solved,
        "accuracy": round(solved * 100 / attempted) if attempted else 0,
        "weak_topics": weak_topics,
        "categories": dict(categories),
    }


def get_category_progress_for_user(user_id):
    return get_progress_for_user(user_id)["categories"]
