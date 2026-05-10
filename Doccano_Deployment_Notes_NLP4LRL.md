# Doccano Deployment Notes for NLP4LRL

## Overview

This document summarizes the local and DigitalOcean VPS deployment workflow used for the NLP4LRL Twi NER annotation platform.

---

# 1. Local Deployment and Testing (MacOS, Windows)

## Purpose
Used for:
- Initial testing
- Annotation workflow validation
- Annotator onboarding
- Pilot experiments

## Components
- Laptop or desktop computer
- Docker Desktop
- ngrok

## Run Doccano Locally

```bash
docker run -d --name doccano \
-e ADMIN_USERNAME=admin \
-e ADMIN_EMAIL=admin@test.com \
-e ADMIN_PASSWORD=StrongPassword123 \
-p 8000:8000 doccano/doccano
```

## Access Locally

```text
http://localhost:8000
```

## Expose Publicly with ngrok

```bash
ngrok http 8000
```

## Limitations
- Computer must remain on
- Internet stability affects availability
- Free ngrok URLs change after restart
- Not suitable for long-term production deployment

---

# 2. Doccano Data Import Workflow

## Preferred Format

JSONL format with one sentence per annotation unit.

## Example

```json
{"id": 1, "text": "Kofi Annan kɔɔ Accra wɔ 2020 mu.", "label": []}
```

## Important Discovery

Doccano accepts empty labels:

```json
"label": []
```

This enables unlabeled annotation workflows.

---

# 3. DigitalOcean VPS Deployment

## Production VPS Configuration

- Provider: DigitalOcean
- OS: Ubuntu 24.04 LTS
- RAM: 2 GB
- CPU: 1 vCPU
- Region: London (recommended for Ghana-based annotators)
- Cost: Approximately $12/month

---

# 4. Docker Installation

## Initial Problem

The apt-based Docker installation failed because:
- `docker-compose-plugin` was unavailable
- `docker.service` was missing

## Successful Installation Method

```bash
curl -fsSL https://get.docker.com | sh
```

## Verify Installation

```bash
docker run hello-world
```

---

# 5. Deploying Custom Fork of Doccano

## Repository Clone

```bash
git clone https://github.com/NLP4LRL/doccano.git
```

## Important Repository Files

```text
docker/Dockerfile.nginx       # Frontend image (Nuxt → Nginx)
docker/Dockerfile.prod        # Backend image (Django + Celery)
docker/docker-compose.prod.yml
```

## Recommendation

Use the official production Docker Compose stack instead of a single-container deployment.

---

# 5a. NLP4LRL Frontend Customizations

## Active Branch

All UI customizations live on:

```text
frontend/nlp4lrl-ui-rebrand
```

## Customizations Made

- **Branding:** NLP4LRL logo, color palette (`#2563eb` primary, `#1e40af` secondary), and favicon replacing all doccano defaults
- **Landing page:** Custom hero banner with gradient background and NLP4LRL logo; updated copy for low-resource language research context; removed GitHub and demo buttons; feature card annotation illustration using real Twi and Ga NER sentences
- **Login page:** NLP4LRL logo and dark gradient background
- **Header:** NLP4LRL logo replacing doccano icon; demo dropdown removed
- **Footer:** NLP4LRL copyright linking to nlp4lrl.com; doccano credited with link to their GitHub
- **Project home:** Redesigned as a role-aware dashboard (replaces doccano video stepper); shows project name, Start Annotation CTA, and quick-action cards filtered by user role

## Building and Deploying Frontend Changes

The VPS has only 2 GB RAM and 1 vCPU — running `yarn build` or `docker build` on it exhausts memory. Always build locally and push to Docker Hub, then pull on the VPS.

**Custom frontend image (Docker Hub):**

```text
billofosuhene/doccano-frontend:nlp4lrl
```

The `docker/docker-compose.prod.yml` nginx service uses this image instead of the upstream `doccano/doccano:frontend`.

**1. Build for linux/amd64 (VPS architecture) and push:**

```bash
docker buildx build \
  --platform linux/amd64 \
  -f docker/Dockerfile.nginx \
  -t billofosuhene/doccano-frontend:nlp4lrl \
  --push \
  .
```

**2. On the VPS, pull and restart only the nginx container:**

```bash
cd /path/to/doccano
git pull origin frontend/nlp4lrl-ui-rebrand
docker compose -f docker/docker-compose.prod.yml pull nginx
docker compose -f docker/docker-compose.prod.yml up -d nginx
```

## Expected nginx bind warnings (harmless)

After restarting the nginx container you may see:

```text
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
nginx: [emerg] bind() to 0.0.0.0:443 failed (98: Address already in use)
```

These are safe to ignore. The host nginx owns ports 80/443; the Docker nginx only listens internally on port 8080 (mapped to `127.0.0.1:8000` on the host).

---

# 6. Environment Configuration (.env)

## Example Configuration

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=StrongPassword123!
ADMIN_EMAIL=admin@nlp4lrl.com

POSTGRES_USER=doccano
POSTGRES_PASSWORD=StrongPassword123!
POSTGRES_DB=doccano

RABBITMQ_DEFAULT_USER=doccano
RABBITMQ_DEFAULT_PASS=StrongPassword123!

CSRF_TRUSTED_ORIGINS=https://annotate.nlp4lrl.com
```

---

# 7. Production Docker Compose Deployment

## Start Production Stack

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Stack Components

- Doccano backend
- PostgreSQL
- RabbitMQ
- Internal nginx

---

# 8. Resolving Port 80 Conflict

## Initial Problem

Docker nginx was binding directly to port 80:

```yaml
ports:
  - 80:8080
```

This prevented Certbot from configuring HTTPS.

## Solution

Updated mapping:

```yaml
ports:
  - 127.0.0.1:8000:8080
```

This allowed:
- Host nginx to own ports 80 and 443
- Docker nginx to remain internal only

---

# 9. Host Nginx Reverse Proxy

## Nginx Configuration

```nginx
server {
    server_name annotate.nlp4lrl.com;

    location / {
        proxy_pass http://127.0.0.1:8000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        proxy_redirect off;
    }
}
```

---

# 10. HTTPS Configuration

## Install Certbot Nginx Plugin

```bash
apt install -y python3-certbot-nginx
```

## Enable HTTPS (both www and non-www)

Run certbot with both domains on a single line:

```bash
certbot --nginx -d annotate.nlp4lrl.com -d www.annotate.nlp4lrl.com
```

## Outcome

- HTTPS enabled for both `annotate.nlp4lrl.com` and `www.annotate.nlp4lrl.com`
- Automatic certificate renewal configured

## www → non-www Redirect

Certbot adds the `www` server blocks to `/etc/nginx/sites-available/default` but without a redirect, causing the nginx welcome page to appear for `www` visitors. Fix both the HTTP and HTTPS `www` blocks in that file:

**HTTP block** — change `$host` to the canonical domain:
```nginx
server {
    if ($host = www.annotate.nlp4lrl.com) {
        return 301 https://annotate.nlp4lrl.com$request_uri;
    } # managed by Certbot

    listen 80;
    listen [::]:80;
    server_name www.annotate.nlp4lrl.com;
    return 404; # managed by Certbot
}
```

**HTTPS block** — add the redirect:
```nginx
server {
    listen 443 ssl;
    server_name www.annotate.nlp4lrl.com;
    ssl_certificate /etc/letsencrypt/live/annotate.nlp4lrl.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/annotate.nlp4lrl.com/privkey.pem; # managed by Certbot

    return 301 https://annotate.nlp4lrl.com$request_uri;
}
```

Then reload nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

# 11. CSRF Issue Resolution

## Error Encountered

```text
CSRF Failed: Origin checking failed
```

## Solution

1. Add:

```env
CSRF_TRUSTED_ORIGINS=https://annotate.nlp4lrl.com
```

2. Configure forwarded proxy headers in nginx

3. Restart Docker Compose stack

---

# 12. Final Production Architecture

```text
https://annotate.nlp4lrl.com
        ↓
Host Nginx + HTTPS
        ↓
127.0.0.1:8000
        ↓
Doccano Docker Stack
```

---

# 13. Recommended Next Steps

## Infrastructure
- Configure automated backups
- Monitor CPU and memory usage
- Add more annotator accounts

## Annotation Workflow
- Run calibration annotation phase
- Compute inter-annotator agreement (IAA)
- Establish adjudication workflow
- Refine annotation guidelines

## Research Workflow
- Export gold-standard datasets
- Build baseline NER models
- Prepare for dataset publication

---

# Final Status

## Completed Successfully

- Custom Doccano deployment from fork
- Docker-based production infrastructure
- PostgreSQL + RabbitMQ orchestration
- HTTPS-secured deployment
- Domain routing via:

```text
https://annotate.nlp4lrl.com
```

- Ghana-accessible annotation platform
- Multi-user annotation support
