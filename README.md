# PrepPilot

PrepPilot is a local interview-preparation application with a Flask API and a React/Vite frontend.

## Project folders

- Backend: `preppilot-backend`
- Frontend: `preppilot-frontend`

The backend runs on `http://localhost:5001` and the Vite frontend runs on `http://localhost:5173`.

## Prerequisites

- Python 3.11 or newer
- Node.js and npm
- PowerShell, Command Prompt, or an equivalent terminal

No cloud account or deployment service is required for local development.

## Backend setup (macOS)

Open Terminal 1 in the repository root and run:

```bash
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install -r preppilot-backend/requirements-dev.txt
cd preppilot-backend
python -m flask --app wsgi:app db upgrade
python -m app.seed.seed_questions
python run.py
```

The virtual environment is local to the repository as `.venv/` and is ignored by Git. Set `SECRET_KEY` and `JWT_SECRET_KEY` in `preppilot-backend/.env` to different random values. Do not commit that file. Set `OPENAI_API_KEY` only to enable the optional AI assistant.

The backend uses SQLite by default at `preppilot-backend/instance/preppilot.db`. Migrations add schema without resetting existing data. Question seeding skips insertion when questions already exist.

The backend dependencies include Flask, SQLAlchemy, Flask-Migrate, JWT, CORS support, SQLite support through Python, the PostgreSQL driver, and `requests` for the optional AI integration.

## Frontend setup

Open Terminal 2 in the repository root and run:

```bash
cd preppilot-frontend
npm install
npm run dev
```

The frontend `.env.example` sets `VITE_API_BASE_URL=http://localhost:5001`. Vite loads `.env` at startup, and the Axios client falls back to `http://localhost:5001` if it is missing.

Vite is configured for host `0.0.0.0` and port `5173`. Open the displayed local URL, normally `http://localhost:5173`.

## Database tables

The migrations create these tables:

- `users`: registration data and password hashes
- `questions`: seeded preparation questions and explanations
- `attempts`: answers and correctness per user
- `conversations`: authenticated AI conversations
- `messages`: conversation messages
- `notes`: study notes private to their owner

Foreign keys connect attempts to users/questions, notes to users, and messages to conversations. The migration is applied with `python -m flask --app wsgi:app db upgrade`; it does not reset existing data.

## Study notes and progress

Notes are stored per user; the API checks ownership when listing, viewing, updating, or deleting a note. Overall and category progress count saved attempt rows. “Solved” counts correct attempts, and accuracy is correct attempts divided by all attempts, rounded to the nearest whole percent. Weak-topic scores use that topic's own correct/attempted ratio and include only topics with an incorrect answer.

## Authentication and API flow

1. Register at `/register`.
2. The frontend sends credentials to `POST /api/auth/register`.
3. Log in at `/login`.
4. The frontend sends credentials to `POST /api/auth/login` and stores the returned JWT in `localStorage` under `preppilot_token`.
5. Axios attaches that token as a Bearer token to authenticated API requests.
6. The app validates the session through `GET /api/auth/me`.
7. Logout removes the token locally and returns the UI to the unauthenticated state.

## Basic demo flow

1. Start the backend and frontend in separate terminals.
2. Open `http://localhost:5173`.
3. Register a demo account, then log in.
4. Open Preparation and select a category and topic.
5. Open Practice, answer a seeded question, and submit it.
6. Review the explanation and open Results or Progress to see the recorded attempt.
7. Open Profile to view the authenticated account.
8. Open Notes to create and manage private study notes.
9. Optionally open AI Assistant. Configure `OPENAI_API_KEY` in the backend environment; without it, the page reports that the assistant is unavailable while the core application remains usable.

The preparation category/topic content is returned by the protected `/api/preparation` endpoint. Practice questions come from `/api/questions`, attempts are submitted to `/api/questions/<id>/attempt`, and results are loaded from `/api/attempts`.

## Tests and local checks

From the backend directory:

```bash
cd preppilot-backend
../.venv/bin/python -m pytest -q tests_pytest
```

From the frontend directory:

```bash
npm test
npm run build
```

## Troubleshooting

- **`ModuleNotFoundError: No module named 'app'`**: run backend commands after changing into `preppilot-backend`.
- **`flask` is not recognized**: activate `.venv`, then rerun the dependency installation command.
- **PowerShell activation is blocked**: use `preppilot-backend\\.venv\\Scripts\\activate.bat` from Command Prompt.
- **Frontend cannot reach the API**: confirm the backend is running on port `5001`, `VITE_API_BASE_URL` is `http://localhost:5001`, and `CORS_ORIGINS` includes `http://localhost:5173`.
- **No practice questions appear**: run `python -m flask --app wsgi:app db upgrade`, then `python -m app.seed.seed_questions` from `preppilot-backend`. If the database contains partial demo data, use a fresh disposable local database as described above because the seed script skips when any question exists.
- **AI Assistant returns an error**: set a valid `OPENAI_API_KEY` in the backend process environment and restart the backend. Never place the key in Git.
- **Port already in use**: stop the existing process using port `5000` or `5173`, then restart the corresponding application.
