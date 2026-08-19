# Preppilot

CI status

- Frontend tests: ![Frontend Tests](https://github.com/OWNER/REPO/actions/workflows/frontend-tests.yml/badge.svg?branch=main)
- Backend tests: ![Backend Tests](https://github.com/OWNER/REPO/actions/workflows/frontend-tests.yml/badge.svg?branch=main)

Replace `OWNER/REPO` above with your GitHub owner and repository name to enable live badges.

Phase 16 — Production Deployment (summary)

This repo includes deployment-ready artifacts to deploy the backend and frontend to common hosting providers.

Backend (recommended: Render / Railway / Heroku)

- WSGI entry: `preppilot-backend/wsgi.py`
- Procfile present for simple platform deploys
- Dockerfile included for containerized deploys
- Configure environment variables: `DATABASE_URL` (Postgres), `JWT_SECRET_KEY`, `SECRET_KEY`, `OPENAI_API_KEY`, `CORS_ORIGINS`
- Run database migrations after deploy: `flask db upgrade` (or use the platform's release command)

Frontend (recommended: Vercel / Netlify)

- Build the frontend: `npm run build` in `preppilot-frontend`
- Deploy the `dist` build directory on Netlify or connect the repo to Vercel for automatic builds

Testing the public deployment

- After deployment, set `CORS_ORIGINS` to include the deployed frontend origin(s)
- Verify API endpoints at `https://<your-backend>/api/` and the frontend site loads and can authenticate users
