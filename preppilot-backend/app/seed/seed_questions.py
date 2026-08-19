from app import create_app
from app.extensions import db
from app.models import Question


QUESTION_DATA = [
    {
        "category": "DSA",
        "topic": "Arrays",
        "company": None,
        "difficulty": "Easy",
        "question_text": "Given an array of integers, find the maximum sum of a contiguous subarray.",
        "options": ["Kadane's algorithm", "Binary search", "Hashing", "DFS"],
        "correct_answer": "Kadane's algorithm",
        "explanation": "Kadane's algorithm keeps track of the best subarray ending at each index and updates the global maximum.",
    },
    {
        "category": "DSA",
        "topic": "Trees",
        "company": None,
        "difficulty": "Medium",
        "question_text": "What is the time complexity of a full inorder traversal of a binary tree with n nodes?",
        "options": ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
        "correct_answer": "O(n)",
        "explanation": "Each node is visited exactly once, so traversal is linear in the number of nodes.",
    },
    {
        "category": "Aptitude",
        "topic": "Percentages",
        "company": None,
        "difficulty": "Easy",
        "question_text": "If a price increases by 20% and then decreases by 20%, what is the net change?",
        "options": ["No change", "4% decrease", "4% increase", "20% decrease"],
        "correct_answer": "4% decrease",
        "explanation": "Starting from 100, a 20% increase gives 120. A 20% decrease on 120 gives 96, which is a 4% net decrease.",
    },
    {
        "category": "Technical",
        "topic": "DBMS",
        "company": None,
        "difficulty": "Medium",
        "question_text": "Which normal form removes transitive dependency from a relation?",
        "options": ["1NF", "2NF", "3NF", "BCNF"],
        "correct_answer": "3NF",
        "explanation": "3NF aims to eliminate transitive dependencies so that non-key attributes depend only on the key.",
    },
    {
        "category": "Technical",
        "topic": "Operating Systems",
        "company": None,
        "difficulty": "Medium",
        "question_text": "Which scheduling algorithm is most likely to minimize average waiting time for short jobs?",
        "options": ["FCFS", "Round Robin", "Priority Scheduling", "SJF"],
        "correct_answer": "SJF",
        "explanation": "Shortest Job First picks the smallest burst time next, which often reduces waiting time for short processes.",
    },
    {
        "category": "Interview",
        "topic": "Behavioral",
        "company": None,
        "difficulty": "Easy",
        "question_text": "What is the best way to answer 'Tell me about yourself' in an interview?",
        "options": ["Give your full life story", "Focus on your academic background and career goals", "Explain only your hobbies", "Avoid structure and speak loosely"],
        "correct_answer": "Focus on your academic background and career goals",
        "explanation": "A strong answer is structured, brief, and linked to your skills, experiences, and future direction.",
    },
    {
        "category": "DSA",
        "topic": "Graphs",
        "company": "Amazon",
        "difficulty": "Medium",
        "question_text": "Which graph traversal is best suited to find the shortest path in an unweighted graph?",
        "options": ["DFS", "BFS", "Dijkstra", "Binary Search"],
        "correct_answer": "BFS",
        "explanation": "Breadth-First Search explores nodes level by level, which guarantees the shortest path in an unweighted graph.",
    },
    {
        "category": "Interview",
        "topic": "Technical",
        "company": "Microsoft",
        "difficulty": "Hard",
        "question_text": "How would you explain the difference between a stack and a queue?",
        "options": ["Both remove newest elements first", "Stack is LIFO and queue is FIFO", "Queue is LIFO and stack is FIFO", "Both store only one element"],
        "correct_answer": "Stack is LIFO and queue is FIFO",
        "explanation": "A stack removes the most recently added element, while a queue removes the oldest added element.",
    },
]


def seed_questions():
    app = create_app()
    with app.app_context():
        existing = Question.query.first()
        if existing:
            print(f"Questions already exist in the database: {Question.query.count()} records.")
            return

        for item in QUESTION_DATA:
            question = Question(
                category=item["category"],
                topic=item["topic"],
                company=item["company"],
                difficulty=item["difficulty"],
                question_text=item["question_text"],
                options=item["options"],
                correct_answer=item["correct_answer"],
                explanation=item["explanation"],
            )
            db.session.add(question)

        db.session.commit()
        print(f"Seeded {len(QUESTION_DATA)} questions successfully.")


if __name__ == "__main__":
    seed_questions()
