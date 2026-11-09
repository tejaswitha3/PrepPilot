# PrepPilot

PrepPilot is an interview-preparation web application. It has a React frontend and a Flask API, with authenticated accounts, topic-based multiple-choice practice, saved answer reviews, progress summaries, and private study notes.

## Features and current scope

- Register, log in, log out, and access protected pages with JWT authentication.
- Browse preparation guides, then start practice filtered by the selected category, topic, and (where applicable) company.
- Submit multiple-choice answers and receive correctness feedback and an explanation.
- Review saved attempts, filter them by category/topic, toggle explanations, and export the filtered results as CSV.
- View progress summaries and edit the current account's profile.
- Create, view, edit, and delete notes scoped to the signed-in user.
- Optionally use the AI Assistant when a supported provider is configured.

The starter library contains 55 catalog questions and covers all 27 displayed Preparation topic filters with at least two questions per filter. Company-tagged entries are clearly labeled illustrative practice examples, not claims about actual past company interview questions.

The Preparation page is a static guide, not an interactive mock interview. Practice currently consists of multiple-choice questions; there is no code editor, coding judge, timed exam, or adaptive recommendation engine. AI chat requires its provider key and has not been verified without a configured provider. The rest of the app is designed to work without AI credentials.

## Technology

- Frontend: React 18, React Router, Vite, Axios, Vitest, and Testing Library.
- Backend: Python 3.11+, Flask, Flask-SQLAlchemy, Flask-Migrate/Alembic, Flask-JWT-Extended, and Flask-CORS.
- Database: SQLite locally; PostgreSQL for the Render deployment configuration.
- Hosting configuration: Render for the Dockerized API/database, Netlify for the static frontend.

## Local setup

Prerequisites: Python 3.11 or newer, Node.js/npm, and Git.

### Backend

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r preppilot-backend/requirements-dev.txt
cd preppilot-backend
if [ ! -f .env ]; then cp .env.example .env; fi
```

Set distinct, private values for `SECRET_KEY` and `JWT_SECRET_KEY` in the local backend environment file. Do not commit environment files or put secrets in frontend variables. Then initialize and run the local database:

```bash
python -m flask --app wsgi:app db upgrade
python -m app.seed.seed_questions
python run.py
```

The default SQLite database is `preppilot-backend/instance/preppilot.db`. Migrations apply schema changes without resetting the database. The question seed is additive and safe to rerun: it inserts missing catalog entries and preserves existing questions, attempts, users, and notes.

### Frontend

In another terminal, from the repository root:

```bash
cd preppilot-frontend
npm ci
if [ ! -f .env ]; then cp .env.example .env; fi
npm run dev
```

The local frontend is normally available at `http://localhost:5173`; the backend is at `http://localhost:5001`. `VITE_API_BASE_URL` should be the backend origin, without an `/api` suffix. The frontend `.env.example` contains the local default.

## Environment variables

Backend variables are documented by `preppilot-backend/.env.example`:

| Variable | Required | Purpose |
|---|---|---|
| `FLASK_ENV` | Yes | Use `development` locally and `production` when deployed. |
| `SECRET_KEY` | Yes in production | Flask signing secret. |
| `JWT_SECRET_KEY` | Yes in production | JWT signing secret; must differ from `SECRET_KEY`. |
| `DATABASE_URL` | Yes in production | PostgreSQL connection string; SQLite is the local default. |
| `CORS_ORIGINS` | Yes in production | Comma-separated exact browser origins allowed to call the API. |
| `OPENAI_API_KEY` | Optional | Enables the configured AI provider; keep it only in the backend environment. |
| `OPENAI_MODEL` | Optional | Provider model override, if supported by the current chat integration. |

`preppilot-frontend/.env.example` documents `VITE_API_BASE_URL`. Frontend `VITE_` variables are public build-time configuration; never put API keys or other secrets in them.

## Database and question seeding

For any database, first apply migrations and then run the seed from `preppilot-backend` with the environment pointing at that database:

```bash
python -m flask --app wsgi:app db upgrade
python -m app.seed.seed_questions
```

The local setup above seeds the local SQLite database. For deployment, Render applies migrations when the backend container starts; production question seeding remains a deliberate manual one-off operation. Run the same seed command from a trusted backend environment configured to use the intended deployment database (for example, the Render service shell when available). Verify the database target before running it. The seed does not delete or update existing questions and does not touch user data. It is not run automatically during production startup.

## Test and build commands

Backend:

```bash
cd preppilot-backend
../.venv/bin/python -m pytest -q tests_pytest
```

Frontend:

```bash
cd preppilot-frontend
npm test
npm run build
```

The backend tests use an isolated in-memory test database. Frontend tests run in Vitest/jsdom. The production frontend build writes static assets to `preppilot-frontend/dist`.

## Deployment

The checked-in deployment setup uses Render for the backend/PostgreSQL and Netlify for the frontend. The Vercel config is not part of this deployment path.

### Deployment steps

1. Create/import the Netlify site and choose its final site subdomain. The root `netlify.toml` sets the monorepo base to `preppilot-frontend` and publishes `dist`.
2. Create the Render services from the root `render.yaml` Blueprint on the `deploy` branch. The Blueprint generates distinct `SECRET_KEY` and `JWT_SECRET_KEY` values and provides the PostgreSQL connection string.
3. Before the backend's first successful startup, set Render `CORS_ORIGINS` to the exact Netlify origin (scheme and hostname, no path). Production startup validates this setting. Set it in the Blueprint/dashboard rather than leaving the `sync: false` value empty.
4. Set Netlify `VITE_API_BASE_URL` to the Render API origin, such as `https://<your-render-service>.onrender.com` (do not append `/api`). A production build intentionally fails if this variable is missing instead of silently pointing a deployed app at localhost. Trigger/retry the Netlify build after setting it.
5. `OPENAI_API_KEY` is optional. Leave it unset to deploy the rest of the application without AI.
6. Backend container startup applies Alembic migrations before starting Gunicorn. Run the idempotent question seed manually as described above; do not point it at a different database.
7. Verify the API root responds, registration/login work, and the browser console shows no CORS or API URL errors.

No public deployment, paid service, or external provider has been created or tested as part of this repository work. Provider account setup, real deployment environment values, domain configuration, and deployed smoke tests remain operator steps. Free-tier behavior, availability, and database retention depend on the hosting provider's current plan.

## Typical user flow

1. Register and log in.
2. Choose a category and topic on Preparation, then start practice.
3. Select an option and submit it; the server records the attempt and returns feedback.
4. Review the saved answer and explanation in Results, or inspect summary statistics in Dashboard/Progress.
5. Edit the signed-in profile or create and manage private study notes.

The question-fetching API does not include correct answers or explanations. The protected attempts endpoint returns review data only for the authenticated user's own attempts. Profile and note operations are also scoped to the current account.

## Troubleshooting

- **Frontend cannot reach the API:** verify `VITE_API_BASE_URL`, that the backend is running on port `5001`, and that backend `CORS_ORIGINS` includes the frontend origin.
- **No questions for a topic:** apply migrations, run the seed against the intended database, and confirm the topic's filter values match the Preparation metadata.
- **AI Assistant is unavailable:** the core app does not require AI; configure `OPENAI_API_KEY` in the backend environment and restart/redeploy to enable it.
- **`ModuleNotFoundError: No module named 'app'`:** run backend commands after changing to `preppilot-backend`.
- **Port is already in use:** stop the process using `5001` or `5173`, then restart the corresponding app.
