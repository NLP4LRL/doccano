# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Doccano

Doccano is an open-source text annotation tool. This fork is deployed at `annotate.nlp4lrl.com` for the NLP4LRL project. See `Doccano_Deployment_Notes_NLP4LRL.md` for deployment-specific details.

## Architecture Overview

**Stack:**
- **Backend:** Django 4.1 + Django REST Framework (Python 3.10+), managed by Poetry
- **Frontend:** Nuxt.js 2 (Vue 2, TypeScript), managed by Yarn
- **Database:** SQLite (dev) / PostgreSQL (production)
- **Async tasks:** Celery + RabbitMQ (file import/export, auto-labeling)
- **Production proxy:** Nginx → Gunicorn

**Request flow:** Host Nginx (HTTPS) → Docker Nginx reverse proxy → Gunicorn (Django) → DRF API. The frontend is built to static files and served by Django at `/backend/client/dist/`.

**Django apps** (each has its own models/views/serializers/tests):
- `api/` — core REST API
- `projects/` — project CRUD and membership
- `labels/` / `label_types/` — annotation labels
- `examples/` — example documents to annotate
- `data_import/` / `data_export/` — file ingestion and export handlers
- `auto_labeling/` — pipeline integration for ML-assisted labeling
- `metrics/` — annotation statistics
- `users/` / `roles/` — auth and RBAC

**Settings modules** live in `backend/config/settings/`: `base.py`, `development.py`, `production.py`, `aws.py`, `gcp.py`, `heroku.py`.

## Backend Commands

All backend commands run from `backend/` using Poetry:

```bash
cd backend

# Install dependencies
poetry install

# Run dev server
poetry run python manage.py runserver

# Database
poetry run task migrate          # apply migrations
poetry run python manage.py makemigrations

# Tests
poetry run task test             # all tests
poetry run python manage.py test <app_label>  # single app
poetry run python manage.py test <app_label>.tests.test_module  # single file

# Linting / formatting
poetry run task flake8
poetry run task isort
poetry run task black
poetry run task mypy

# Seed / admin
poetry run python manage.py create_roles
poetry run python manage.py create_admin  # uses env vars
```

## Frontend Commands

All frontend commands run from `frontend/`:

```bash
cd frontend

yarn install
yarn dev            # hot-reload dev server at localhost:3000
yarn build          # production build
yarn lint           # ESLint
yarn lintfix        # ESLint auto-fix
yarn lint:prettier  # Prettier check
yarn fix:prettier   # Prettier format
yarn test           # Jest unit tests
```

## Docker / Production

```bash
# Production stack (PostgreSQL + RabbitMQ + Celery + Flower + Nginx)
docker compose -f docker/docker-compose.prod.yml up -d

# Copy and edit environment variables before first run
cp docker/.env.example docker/.env
```

Key env vars: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `POSTGRES_*`, `RABBITMQ_DEFAULT_*`, `CSRF_TRUSTED_ORIGINS`, `SECRET_KEY`, `DJANGO_SETTINGS_MODULE`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push:
- **Backend:** migrations, flake8, isort, black, mypy, pytest (Python 3.10)
- **Frontend:** ESLint, Prettier (Node 18)
