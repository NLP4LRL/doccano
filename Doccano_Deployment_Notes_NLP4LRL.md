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
docker/Dockerfile.prod
docker/docker-compose.prod.yml
```

## Recommendation

Use the official production Docker Compose stack instead of a single-container deployment.

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

## Enable HTTPS

```bash
certbot --nginx -d annotate.nlp4lrl.com
```

## Outcome

- HTTPS enabled successfully
- Automatic certificate renewal configured

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
