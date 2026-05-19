# CRM ERP — ProLead

Full-stack CRM for lead management: React + Vite frontend, Express + Neon PostgreSQL backend.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS 4, TanStack Query, Wouter |
| Backend | Express.js, TypeScript, Drizzle ORM |
| Database | [Neon](https://neon.tech) PostgreSQL |
| Auth | JWT (users stored in Neon) |

## Project structure

```
crm-erp/
├── src/                 # React frontend
├── backend/
│   ├── src/
│   │   ├── config/      # Environment validation
│   │   ├── db/          # Drizzle schema & connection
│   │   ├── middleware/  # Auth, errors, validation
│   │   ├── modules/     # Feature modules (auth, leads, …)
│   │   ├── routes/      # API router
│   │   └── scripts/     # Database seed
│   └── .env             # Your Neon credentials (not committed)
```

## Setup

### 1. Neon database

1. Open your Neon project → **Connect** → copy the **pooled** connection string.
2. Paste it into `backend/.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-long-random-secret
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 2. Install & initialize

```bash
# Backend
cd backend
npm install
npm run db:setup    # push schema + seed data

# Frontend (from project root)
cd ..
npm install
```

### 3. Run

**Terminal 1 — API:**
```bash
cd backend && npm run dev
```

**Terminal 2 — UI:**
```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API health: http://localhost:3001/api/health  

## Login (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@prolead.com` | `prolead123` |
| Supervisor | `supervisor1@prolead.com` | `prolead123` |
| Agent | `agent1@prolead.com` | `prolead123` |

Quick-login buttons on the login page also work via `POST /api/auth/quick-login`.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Email + password |
| POST | `/api/auth/quick-login` | Role-based demo login |
| GET | `/api/auth/me` | Current user |
| GET/POST/PATCH/DELETE | `/api/leads` | Leads CRUD |
| GET | `/api/agents` | Agents / users |
| GET | `/api/campaigns` | Campaigns |
| GET/PATCH/DELETE | `/api/notifications` | Notifications |
| GET/POST/PATCH | `/api/tasks` | Agent tasks |
| GET | `/api/analytics/dashboard` | Dashboard stats |

All protected routes require `Authorization: Bearer <token>`.

## Push to GitHub

The repo root is the `crm-erp` folder (frontend + `backend/` in one project).

```bash
cd "/Users/mouaad/Downloads/artifacts 2/crm-erp"

# 1. Create a new empty repo on GitHub (e.g. crm-erp), then:
git remote add origin https://github.com/YOUR_USERNAME/crm-erp.git
git checkout -b dev
git push -u origin dev
```

**Branches:** `dev` is the default development branch. Merge `dev` → `main` for production releases.

CI runs on push to `dev` and on pull requests targeting `dev` or `main`.
