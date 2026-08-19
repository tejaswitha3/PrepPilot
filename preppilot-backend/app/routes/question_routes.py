from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Attempt
from app.services.question_service import get_question_by_id, get_questions, serialize_question
from app.services.question_service import get_attempts_for_user, serialize_attempt


question_bp = Blueprint("questions", __name__, url_prefix="/api")


@question_bp.route("/questions", methods=["GET"])
@jwt_required()
def list_questions():
    category = request.args.get("category")
    topic = request.args.get("topic")
    company = request.args.get("company")
    difficulty = request.args.get("difficulty")

    questions = get_questions(category=category, topic=topic, company=company, difficulty=difficulty)
    return jsonify([serialize_question(question) for question in questions])


@question_bp.route("/questions/<int:question_id>", methods=["GET"])
@jwt_required()
def get_question(question_id):
    question = get_question_by_id(question_id)
    if not question:
        return jsonify({"error": "Question not found."}), 404
    return jsonify(serialize_question(question))


@question_bp.route("/questions/<int:question_id>/attempt", methods=["POST"])
@jwt_required()
def submit_attempt(question_id):
    question = get_question_by_id(question_id)
    if not question:
        return jsonify({"error": "Question not found."}), 404

    data = request.get_json(silent=True) or {}
    selected_answer = data.get("selected_answer")

    if selected_answer is None:
        return jsonify({"error": "selected_answer is required."}), 400

    is_correct = selected_answer == question.correct_answer
    user_id = int(get_jwt_identity())

    attempt = Attempt(
        user_id=user_id,
        question_id=question.id,
        selected_answer=selected_answer,
        is_correct=is_correct,
    )
    db.session.add(attempt)
    db.session.commit()

    return jsonify(
        {
            "id": attempt.id,
            "question_id": question.id,
            "selected_answer": selected_answer,
            "is_correct": is_correct,
            "correct_answer": question.correct_answer,
            "explanation": question.explanation,
        }
    )


@question_bp.route('/attempts', methods=['GET'])
@jwt_required()
def list_attempts():
    user_id = int(get_jwt_identity())
    attempts = get_attempts_for_user(user_id)
    return jsonify([serialize_attempt(a) for a in attempts])


@question_bp.route('/preparation', methods=['GET'])
@jwt_required()
def get_preparation():
    """Return structured preparation categories and topics.

    This endpoint is intentionally static for Phase 8 and returns a JSON
    structure consumed by the frontend. Kept protected to match app auth rules.
    """
    data = {
        "categories": [
            {
                "id": "dsa",
                "name": "DSA / Coding",
                "topics": [
                    {"id": "arrays", "name": "Arrays", "intro": "Arrays: contiguous memory structure, common operations include traversal, prefix/suffix sums, two-pointer techniques, sliding windows."},
                    {"id": "strings", "name": "Strings", "intro": "Strings: character sequences, pattern matching, substring search, and common algorithms like KMP, rolling hash."},
                    {"id": "linked-lists", "name": "Linked Lists", "intro": "Linked Lists: nodes and pointers — practice reversing, merging, cycle detection, and slow/fast pointers."},
                    {"id": "stacks-queues", "name": "Stacks & Queues", "intro": "Stacks & Queues: LIFO and FIFO structures, use for expression parsing, BFS, and monotonic stacks."},
                    {"id": "trees", "name": "Trees", "intro": "Trees: binary trees, traversals, BST properties, and common problems on height, depth, and balancing."},
                    {"id": "graphs", "name": "Graphs", "intro": "Graphs: adjacency lists/matrices, DFS/BFS, shortest paths, and connectivity."},
                    {"id": "searching", "name": "Searching", "intro": "Searching: binary search patterns, search on answer, and randomized search techniques."},
                    {"id": "sorting", "name": "Sorting", "intro": "Sorting: comparison sorts, complexity trade-offs, and stable vs unstable sorts."},
                    {"id": "dp", "name": "Dynamic Programming", "intro": "Dynamic Programming: memoization, tabulation, knapsack, LIS, DP on trees and sequences."},
                ],
            },
            {
                "id": "aptitude",
                "name": "Aptitude",
                "topics": [
                    {"id": "quant", "name": "Quantitative Aptitude", "intro": "Quant: number theory, ratios, percentages, work/time, and speed/distance."},
                    {"id": "logical", "name": "Logical Reasoning", "intro": "Logical Reasoning: puzzles, seating arrangements, syllogisms, and pattern recognition."},
                    {"id": "verbal", "name": "Verbal Ability", "intro": "Verbal: reading comprehension, grammar, para-jumbles, and vocabulary."},
                    {"id": "prob", "name": "Probability", "intro": "Probability: basics of events, conditional probability, distributions, and expected value."},
                    {"id": "permcomb", "name": "Permutations & Combinations", "intro": "Permutations & Combinations: counting principles, factorial notation, combinations with repetition."},
                ],
            },
            {
                "id": "technical",
                "name": "Technical Subjects",
                "topics": [
                    {"id": "oop", "name": "OOP", "intro": "OOP: classes, inheritance, polymorphism, design principles and common design patterns."},
                    {"id": "dbms", "name": "DBMS", "intro": "DBMS: normalization, transactions, indexing, and query optimization."},
                    {"id": "os", "name": "Operating Systems", "intro": "Operating Systems: processes, threads, scheduling, memory management, and synchronization."},
                    {"id": "networks", "name": "Computer Networks", "intro": "Networks: OSI/TCP models, routing, TCP/UDP differences, and basic protocols."},
                    {"id": "se", "name": "Software Engineering", "intro": "Software Engineering: SDLC, testing, design, and agile practices."},
                    {"id": "pf", "name": "Programming Fundamentals", "intro": "Programming Fundamentals: data types, control flow, complexity analysis, and debugging."},
                ],
            },
            {
                "id": "interview",
                "name": "Interview Preparation",
                "topics": [
                    {"id": "technical-interview", "name": "Technical Interview", "intro": "Technical Interview: problem solving approach, whiteboarding, and communication tips."},
                    {"id": "hr-interview", "name": "HR Interview", "intro": "HR Interview: common HR questions, salary discussions, and negotiation strategies."},
                    {"id": "behavioral", "name": "Behavioral Questions", "intro": "Behavioral: STAR technique, structuring responses, and framing achievements."},
                    {"id": "resume", "name": "Resume-based Preparation", "intro": "Resume Prep: highlighting projects, quantifying impact, and tailoring for roles."},
                    {"id": "mock", "name": "Mock Interviews", "intro": "Mock Interviews: how to run and get feedback from mocks, peer reviews."},
                ],
            },
            {
                "id": "company",
                "name": "Company Preparation",
                "topics": [
                    {"id": "amazon-demo", "name": "Amazon (Demo)", "intro": "Amazon demo: prepare system design basics, behavioral leadership principles, and common coding patterns asked at Amazon."},
                    {"id": "microsoft-demo", "name": "Microsoft (Demo)", "intro": "Microsoft demo: focus on product sense, coding, and design questions frequently seen in Microsoft interviews."},
                ],
            },
        ]
    }

    return jsonify(data)
