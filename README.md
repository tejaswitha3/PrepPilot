# PrepPilot

PrepPilot is a local interview-preparation application with a Flask API and a React/Vite frontend.

## Project folders

- Backend: `preppilot-backend`
- Frontend: `preppilot-frontend`

The backend runs on `http://localhost:5000` and the Vite frontend runs on `http://localhost:5173`.

## Prerequisites

- Python 3.11 or newer
- Node.js and npm
- PowerShell, Command Prompt, or an equivalent terminal

No cloud account or deployment service is required for local development.

## Backend setup

Open a terminal in the repository root and run these commands one at a time:

```powershell
Set-Location preppilot-backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install -r requirements.txt
$env:FLASK_ENV = "development"
$env:CORS_ORIGINS = "http://localhost:5173"
python -m flask --app wsgi:app db upgrade
python -m app.seed.seed_questions
python run.py
```

The virtual environment is local to `preppilot-backend/.venv` and is ignored by Git. If PowerShell blocks activation, use Command Prompt activation:

```cmd
preppilot-backend\\.venv\\Scripts\\activate.bat
```

The backend uses SQLite by default at `preppilot-backend/instance/preppilot.db` for local development. `python -m flask --app wsgi:app db upgrade` applies the existing Alembic migration. The seed command is safe to repeat because it skips insertion when any questions already exist. For a fresh disposable demo database, stop the backend, remove `instance/preppilot.db`, then run the migration and seed commands again.

The backend dependencies include Flask, SQLAlchemy, Flask-Migrate, JWT, CORS support, SQLite support through Python, the PostgreSQL driver, and `requests` for the optional AI integration.

## Backend environment variables

The backend has development defaults for the application and JWT keys. For a local demo, set these values in the backend terminal if you want explicit placeholders:

```powershell
$env:SECRET_KEY = "local-secret-key"
$env:JWT_SECRET_KEY = "local-jwt-secret-key"
$env:CORS_ORIGINS = "http://localhost:5173"
```

Do not use real production secrets in source files or documentation. `DATABASE_URL` is optional for local development; when omitted, SQLite is used. `OPENAI_API_KEY` is optional for the core practice flow and required only for live AI responses. The optional AI service also supports `OPENAI_API_BASE` and `OPENAI_MODEL`.

## Frontend setup

Open a second terminal in the repository root and run these commands one at a time:

```powershell
Set-Location preppilot-frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend `.env.example` sets `VITE_API_BASE_URL=http://localhost:5000`. Vite loads `.env` at startup, and the Axios client uses this value for API requests. If `.env` is missing, the client intentionally falls back to `http://localhost:5000`.

Vite is configured for host `0.0.0.0` and port `5173`. Open the displayed local URL, normally `http://localhost:5173`.

## Database tables

The existing migration creates these tables:

- `users`: registration data and password hashes
- `questions`: seeded preparation questions and explanations
- `attempts`: answers and correctness per user
- `conversations`: authenticated AI conversations
- `messages`: conversation messages

Foreign keys connect attempts to users/questions and messages to conversations. The migration is applied with `python -m flask --app wsgi:app db upgrade`; it does not reset existing data.

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
8. Optionally open AI Assistant. Set `OPENAI_API_KEY` in the backend terminal first; without it, the AI request returns a provider-configuration error while the rest of the application remains usable.

The preparation category/topic content is returned by the protected `/api/preparation` endpoint. Practice questions come from `/api/questions`, attempts are submitted to `/api/questions/<id>/attempt`, and results are loaded from `/api/attempts`.

## Tests and local checks

From the backend directory:

```powershell
python -m pytest -q
```

The backend suite currently passes 19 tests when run from `preppilot-backend`.

From the frontend directory:

```powershell
npm test
npm run build
```

If Windows Application Control blocks Rollup or another native Node module, leave the security policy unchanged and mark frontend verification as environment-blocked. The GitHub workflow runs the frontend tests on Ubuntu independently.

## Troubleshooting

- **`ModuleNotFoundError: No module named 'app'`**: run backend commands after changing into `preppilot-backend`.
- **`flask` is not recognized**: activate `.venv`, then rerun the dependency installation command.
- **PowerShell activation is blocked**: use `preppilot-backend\\.venv\\Scripts\\activate.bat` from Command Prompt.
- **Frontend cannot reach the API**: confirm the backend is running on port `5000`, `.env` contains `VITE_API_BASE_URL=http://localhost:5000`, and `CORS_ORIGINS` includes `http://localhost:5173`.
- **No practice questions appear**: run `python -m flask --app wsgi:app db upgrade`, then `python -m app.seed.seed_questions` from `preppilot-backend`. If the database contains partial demo data, use a fresh disposable local database as described above because the seed script skips when any question exists.
- **AI Assistant returns an error**: set a valid `OPENAI_API_KEY` in the backend process environment and restart the backend. Never place the key in Git.
- **Port already in use**: stop the existing process using port `5000` or `5173`, then restart the corresponding application.
