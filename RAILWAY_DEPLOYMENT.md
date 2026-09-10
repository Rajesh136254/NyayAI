# Deploy NYAYAI on Railway

## Short Answer

Yes, NYAYAI can be deployed on Railway.

The easiest setup is to create **two Railway services from the same GitHub repository**:

1. **Backend service:** FastAPI API
2. **Frontend service:** Next.js web application

The frontend calls the backend through the backend's public Railway URL.

```text
User browser
    |
    v
Next.js frontend service
    |
    v
FastAPI backend service
    |
    v
PostgreSQL database and file storage
```

The current synthetic-data MVP can be deployed fairly easily. Before using real prisoner or legal data, database persistence, file storage, security, backups, and approved integrations must be upgraded.

---

## Important Current Limitations

### SQLite is suitable only for a demo

The backend currently defaults to:

```text
sqlite:///./nyayai.db
```

Railway services use ephemeral containers. A local SQLite file can be lost when the service is redeployed or restarted.

For a temporary demo, SQLite may work. For a persistent deployment, use Railway PostgreSQL and set `DATABASE_URL` to the PostgreSQL connection string.

### Uploaded files need persistent storage

The MVP document upload flow stores uploaded files on the backend filesystem. Those files can be lost after a redeploy or restart.

For a real deployment, use an object-storage service such as:

- S3-compatible storage
- Cloudflare R2
- Google Cloud Storage
- Azure Blob Storage

### CORS must allow the deployed frontend

The backend currently allows local development URLs. After the frontend is deployed, the backend must allow the Railway frontend domain.

Example production origin:

```text
https://nyayai-frontend-production.up.railway.app
```

Do not use `*` for a production system containing sensitive data.

### Do not use demo secrets in production

The default `SECRET_KEY` in the code is for development only. Set a long, random Railway variable before deployment.

---

## Prerequisites

You need:

- A GitHub account
- A Railway account
- This project pushed to GitHub
- A working local build
- The backend and frontend folders in the repository root

Recommended local checks:

```powershell
cd C:\Users\rajes\Desktop\NYAYAI\backend
python -m compileall app

cd C:\Users\rajes\Desktop\NYAYAI\frontend
npm install
npx tsc --noEmit
npm run build
```

The repository currently contains older ESLint warnings/errors in several files. TypeScript compilation and the backend compile check are the more useful deployment checks until that lint debt is cleaned up.

---

## Step 1: Push the Project to GitHub

From the project root:

```powershell
cd C:\Users\rajes\Desktop\NYAYAI
git init
git add .
git commit -m "Prepare NYAYAI MVP for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If the repository already has Git configured, do not repeat `git init` or `git remote add`.

Before pushing, make sure these are not committed:

- `.env` files
- `nyayai.db` if it contains private data
- Uploaded documents
- Passwords, API keys, and tokens

---

## Step 2: Create the Backend Service

1. Open Railway.
2. Select **New Project**.
3. Select **Deploy from GitHub repo**.
4. Choose the NYAYAI repository.
5. Create the first service for the backend.
6. Set the service **Root Directory** to:

```text
/backend
```

7. Set the backend start command to:

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

For Render, set this environment variable in the backend service:

```text
PYTHON_VERSION=3.11.9
```

The repository also contains `runtime.txt` files for both the repository root and `/backend`. The environment variable is the authoritative Render setting. Python 3.11.9 is required by the currently pinned Pydantic dependencies. Without this pin, Render may select Python 3.14 and attempt to compile `pydantic-core` from Rust during deployment.

Railway supplies the `$PORT` variable. Do not hard-code port `8000` in the production command.

8. Deploy the service.
9. Open the generated backend public domain.

Test these URLs:

```text
https://YOUR-BACKEND-DOMAIN/health
https://YOUR-BACKEND-DOMAIN/docs
```

The health endpoint should return a healthy response. The `/docs` page should show the FastAPI API documentation.

### First deployment with demo data

To create the tables and seed the synthetic MVP data automatically on the first startup, add this backend variable:

```text
SEED_ON_STARTUP=true
```

Tables are created automatically. The seed runs only when the database has no inmate records. After the first successful deployment, change the variable to:

```text
SEED_ON_STARTUP=false
```

This prevents later restarts from attempting to seed again.

---

## Step 3: Configure Backend Variables

In the Railway backend service, open **Variables** and add:

```text
SECRET_KEY=<long-random-production-secret>
ACCESS_TOKEN_EXPIRE_MINUTES=480
APP_NAME=NYAYAI
APP_VERSION=1.0.0
```

### Temporary demo database

For a disposable synthetic-data demo, you can use:

```text
DATABASE_URL=sqlite:///./nyayai.db
```

This is not recommended for real or persistent deployment.

### Recommended PostgreSQL database

1. In the Railway project, select **Add**.
2. Select **Database**.
3. Select **PostgreSQL**.
4. Copy the PostgreSQL connection variable or reference it from the backend service.
5. Set:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

The exact reference name may differ if the PostgreSQL service has a different name.

The application now selects the database driver automatically:

- No `DATABASE_URL` locally: uses `sqlite:///./nyayai.db`.
- `postgres://...` on Railway: uses PostgreSQL through `psycopg`.
- `postgresql://...` on Railway: uses PostgreSQL through `psycopg`.

SQLite-only settings are applied only to SQLite, so the same code works in local development and Railway deployment.

---

## Step 4: Seed Synthetic Demo Data

The seed script deletes and recreates the synthetic database. Never run it against a database containing real records.

For the recommended first demo deployment, set `SEED_ON_STARTUP=true` and redeploy once. The application will seed only an empty database. Then set it back to `false`.

Alternatively, run it through Railway's service shell if available:

```bash
python seed.py
```

The script creates:

- Demo users
- Ten synthetic undertrial records
- Cases and hearings
- Action items
- Documents
- Bail applications
- UTRC reviews
- Deadlines

Demo login accounts are listed in the main project README.

For a persistent PostgreSQL deployment, database migrations should be added before using `create_all` and the destructive seed script in a shared environment.

---

## Step 5: Configure Production CORS

The frontend will call the backend from a different domain. Add the deployed frontend URL to the backend CORS configuration.

The backend should allow an origin like:

```text
https://YOUR-FRONTEND-DOMAIN.up.railway.app
```

Recommended improvement: read allowed origins from an environment variable, for example:

```text
FRONTEND_URL=https://YOUR-FRONTEND-DOMAIN.up.railway.app
```

Then include that value in FastAPI `allow_origins`.

After changing the backend CORS configuration, redeploy the backend service.

---

## Step 6: Create the Frontend Service

1. In the same Railway project, select **New Service**.
2. Select the same GitHub repository.
3. Set the frontend **Root Directory** to:

```text
/frontend
```

4. Railway should detect the Next.js application.
5. Set the frontend start command to:

```text
npm run start -- -p $PORT
```

6. Add this frontend variable:

```text
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN.up.railway.app
```

7. Deploy the frontend service.
8. Open the generated frontend domain.

The frontend API client reads `NEXT_PUBLIC_API_URL` when the browser makes API requests.

---

## Step 7: Test the Deployed MVP

### Backend checks

Open:

```text
https://YOUR-BACKEND-DOMAIN/health
https://YOUR-BACKEND-DOMAIN/docs
```

### Frontend checks

Open:

```text
https://YOUR-FRONTEND-DOMAIN
```

Test:

1. Login with a demo account.
2. Open the dashboard.
3. Click Urgent, Attention required, and No immediate action.
4. Click the KPI cards.
5. Click workflow stages.
6. Open a case profile.
7. Check the timeline, documents, bail history, UTRC records, deadlines, and connected records.
8. Open Delay Intelligence and confirm hearing data appears.
9. Test document upload with a synthetic file only.
10. Check both light and dark modes.

### Browser developer checks

If the page loads but data is missing, open the browser developer tools and check:

- Failed API requests
- CORS errors
- `NEXT_PUBLIC_API_URL` value
- Backend response status codes
- Backend Railway logs

---

## Recommended Production Improvements Before Real Data

### Database

- Use PostgreSQL.
- Add Alembic migrations.
- Remove destructive seeding from production.
- Add indexes and retention policies.
- Add backup and restore testing.

### Security

- Generate a strong secret key.
- Restrict CORS to approved domains.
- Use HTTPS only.
- Add proper role-based permissions.
- Add rate limiting.
- Store secrets only in Railway variables.
- Add audit logging for document access and downloads.
- Review DPDP and government data-handling requirements.

### Documents

- Move files to encrypted object storage.
- Do not store sensitive files on the Railway container filesystem.
- Add malware scanning.
- Add file-size and file-type restrictions.
- Add document versioning.
- Add access checks for every download.

### Integrations

- Build read-only connectors first.
- Obtain approval for e-Prisons, eCourts/CNR, and DLSA data access.
- Add source-system identifiers.
- Record sync time and source status.
- Handle conflicts and duplicate records.
- Require human verification before external actions.

---

## Is Railway Easy for This Project?

For a **synthetic-data demo**, yes:

- Two services
- Two root directories
- One backend URL variable in the frontend
- One backend URL in CORS
- Optional seed command

For a **real production system**, deployment is only one part of the work. The difficult parts are secure data storage, PostgreSQL migration, document storage, identity and permissions, approved government integrations, backups, and compliance controls.

Recommended path:

```text
Railway demo with synthetic data
        -> PostgreSQL and object storage
        -> security and permissions review
        -> approved pilot with read-only integrations
        -> production deployment
```

---

## Useful Railway Commands

Install Railway CLI if needed:

```powershell
npm install -g @railway/cli
```

Login:

```powershell
railway login
```

Link the local project:

```powershell
railway link
```

View logs:

```powershell
railway logs
```

Open the deployed service:

```powershell
railway open
```

---

## Final Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend Railway service created
- [ ] Backend root directory set to `/backend`
- [ ] Backend start command uses `$PORT`
- [ ] Backend health endpoint works
- [ ] Backend public domain copied
- [ ] Production `SECRET_KEY` configured
- [ ] Database choice made: temporary SQLite or PostgreSQL
- [ ] Synthetic seed run only on a disposable/demo database
- [ ] Frontend Railway service created
- [ ] Frontend root directory set to `/frontend`
- [ ] `NEXT_PUBLIC_API_URL` points to backend
- [ ] Backend CORS allows frontend domain
- [ ] Frontend login works
- [ ] Dashboard API data loads
- [ ] Delay Intelligence data loads
- [ ] Case profile data loads
- [ ] Document upload tested with synthetic data
- [ ] No real sensitive data used before security review
