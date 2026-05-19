# ProLead CRM/ERP — Complete Technical Documentation

> **Version:** 1.0  
> **Stack:** React 18 + Vite 6 + Express 4 + PostgreSQL (Neon) + Drizzle ORM  
> **Default branch:** `dev`

This document describes the **ProLead CRM/ERP** application from A to Z: architecture, setup, database, API, frontend, roles, and workflows.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Repository Structure](#4-repository-structure)
5. [Getting Started (A → Z)](#5-getting-started-a--z)
6. [Environment Variables](#6-environment-variables)
7. [Database](#7-database)
8. [Backend API Reference](#8-backend-api-reference)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Pages & Features by Role](#11-pages--features-by-role)
12. [Data Flow Examples](#12-data-flow-examples)
13. [CI/CD & Git Workflow](#13-cicd--git-workflow)
14. [Development Guide](#14-development-guide)
15. [Troubleshooting](#15-troubleshooting)
16. [Appendix](#16-appendix)

---

## 1. Project Overview

**ProLead CRM/ERP** is a call-center CRM for managing:

- **Leads** — prospects with status, priority, notes, and agent assignment
- **Campaigns** — marketing/sales campaigns that group leads
- **Agents** — call-center operators with performance stats
- **Tasks** — per-user to-do items
- **Notifications** — system and business alerts
- **CSV Import** — bulk lead import with preview and history
- **Analytics** — dashboards with KPIs, funnels, and charts

The app supports **three roles**:

| Role | Description |
|------|-------------|
| **Admin** | Full access: users, import, settings, all modules |
| **Supervisor** | Manage leads, campaigns, agents, analytics, import |
| **Agent** | Own workspace, assigned leads, tasks, notifications |

---

## 2. Technology Stack

### Frontend (`/`)

| Layer | Technology |
|-------|------------|
| UI | React 18, TypeScript |
| Build | Vite 6 |
| Routing | Wouter |
| Server state | TanStack React Query v5 |
| Local UI state | React Context (`appStore`) |
| Styling | Tailwind CSS 4, shadcn/ui (Radix) |
| Charts | Recharts |
| Animations | Framer Motion |
| Forms / validation | React Hook Form + Zod |
| Toasts | Sonner |
| Dates | date-fns |

### Backend (`/backend`)

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Language | TypeScript (ESM) |
| ORM | Drizzle ORM |
| Database | PostgreSQL on **Neon** |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Security | Helmet, CORS, compression |

---

## 3. Architecture

```mermaid
flowchart TB
    subgraph Browser
        UI[React SPA - Vite :5173]
        RQ[TanStack Query]
        Auth[useAuth + localStorage]
        UI --> RQ
        UI --> Auth
    end

    subgraph Backend
        API[Express API :3001]
        MW[Middleware: auth, validate, errors]
        MOD[Modules: auth, leads, campaigns, ...]
        API --> MW --> MOD
    end

    subgraph Data
        DB[(Neon PostgreSQL)]
        MOD --> DB
    end

    RQ -->|/api proxy| API
    Auth -->|Bearer JWT| API
```

### Request lifecycle

1. User opens the React app (`localhost:5173`).
2. Vite proxies `/api/*` → `http://localhost:3001`.
3. Frontend attaches `Authorization: Bearer <token>` on protected calls.
4. Express validates JWT, runs Zod validation, executes service logic.
5. Drizzle queries Neon PostgreSQL.
6. Response shape: `{ success: true, data: ... }` or `{ success: false, error: ... }`.

---

## 4. Repository Structure

```
crm-erp/
├── .github/workflows/ci.yml    # CI on push to dev
├── DOCUMENTATION.md            # This file
├── README.md                   # Quick start
├── package.json                # Frontend scripts & deps
├── vite.config.ts              # Vite + API proxy
├── tsconfig.json
│
├── src/                        # FRONTEND
│   ├── main.tsx                # React entry
│   ├── App.tsx                 # Routes + guards
│   ├── types/index.ts          # Shared TS types
│   ├── lib/
│   │   ├── api.ts              # HTTP client + JWT
│   │   ├── api-types.ts        # API DTOs
│   │   ├── leads-query.ts      # Build /leads query strings
│   │   ├── csv.ts              # CSV parser (import UI)
│   │   └── utils.ts            # cn() helper
│   ├── hooks/
│   │   ├── useAuth.ts          # Login, roles, route access
│   │   ├── useAppData.ts       # React Query hooks
│   │   └── useLeadActions.ts   # Lead mutations
│   ├── store/
│   │   └── appStore.tsx        # Global leads/agents/campaigns cache
│   ├── pages/                  # Route pages (see §11)
│   ├── components/
│   │   ├── layout/             # Sidebar, Topbar, DashboardLayout
│   │   ├── leads/              # LeadDrawer, badges
│   │   ├── admin/              # UserFormDialog
│   │   ├── shared/             # StatCard, PageTransition, etc.
│   │   └── ui/                 # shadcn components
│   └── data/                   # Legacy mock data (not used at runtime)
│
└── backend/                    # BACKEND
    ├── package.json
    ├── drizzle.config.ts
    ├── .env.example
    └── src/
        ├── index.ts            # Server bootstrap
        ├── app.ts              # Express app factory
        ├── config/env.ts       # Validated env vars
        ├── db/
        │   ├── index.ts        # Drizzle client (Neon)
        │   └── schema.ts       # All tables + relations
        ├── middleware/
        │   ├── auth.ts         # JWT sign/verify, requireRoles
        │   ├── validate.ts     # Zod body/query/params
        │   └── errorHandler.ts
        ├── routes/index.ts     # Mount all API routers
        ├── modules/            # Feature modules (see §8)
        ├── shared/
        │   ├── errors.ts       # AppError, NotFound, Forbidden
        │   ├── mappers.ts      # DB row → API DTO
        │   └── params.ts       # req.params.id helper
        └── scripts/
            ├── seed.ts         # Demo data
            └── test-db.ts      # Connection test
```

### Backend module pattern

Each feature follows:

```
modules/<name>/
  <name>.routes.ts    # Express router + middleware chain
  <name>.controller.ts # HTTP handlers (thin)
  <name>.service.ts   # Business logic + DB
  <name>.schema.ts    # Zod validation schemas
```

---

## 5. Getting Started (A → Z)

### Prerequisites

- **Node.js** 20+
- **npm** 9+
- **Neon** account (free tier) — [neon.tech](https://neon.tech)
- **Git** (optional, for GitHub)

### Step A — Clone / open project

```bash
cd "/path/to/crm-erp"
```

### Step B — Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend && npm install && cd ..
```

### Step C — Configure Neon database

1. Create a project on Neon.
2. Copy the **connection string** (pooled URL recommended).
3. Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

4. Edit `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
JWT_SECRET=your-long-random-secret-min-16-chars
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Step D — Push schema & seed data

```bash
npm run db:setup
# Equivalent to: cd backend && npm run db:push && npm run db:seed
```

This creates all tables and inserts demo users, campaigns, leads, tasks, and notifications.

### Step E — Start backend

```bash
cd backend && npm run dev
# API: http://localhost:3001
# Health: http://localhost:3001/api/health
```

### Step F — Start frontend

```bash
# New terminal, from project root
npm run dev
# App: http://localhost:5173
```

Or run both:

```bash
npm run dev:all
```

### Step G — Log in

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@prolead.com` | `prolead123` |
| Supervisor | `supervisor1@prolead.com` | `prolead123` |
| Agent | `agent1@prolead.com` | `prolead123` |

The login page also supports **quick login** by role (dev/demo).

### Step H — Verify

- Admin → Dashboard, Leads, Import CSV, Agents (user CRUD)
- Agent → Mon Workspace, Mes Leads (only assigned leads), Mes Tâches

---

## 6. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | Neon PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Min 16 chars; signs JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `PORT` | No | `3001` | API server port |
| `NODE_ENV` | No | `development` | `development` \| `production` \| `test` |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Comma-separated allowed origins |

### Frontend (optional)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (default `/api` via Vite proxy) |
| `PORT` | Vite dev server port (default `5173`) |
| `BASE_PATH` | Base path for deployment |

---

## 7. Database

### 7.1 Entity Relationship (simplified)

```mermaid
erDiagram
    users ||--o{ leads : "assigned to"
    users ||--o{ tasks : owns
    users ||--o{ notifications : receives
    users ||--o{ import_jobs : runs
    users ||--o{ lead_notes : writes
    campaigns ||--o{ leads : contains
    leads ||--o{ lead_notes : has
```

### 7.2 Tables

#### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| email | varchar(255) | unique |
| password_hash | text | bcrypt |
| first_name, last_name, full_name | varchar | |
| role | enum | Admin, Supervisor, Agent |
| phone | varchar | optional |
| is_online | boolean | updated on login/logout |
| avatar_initials | varchar(5) | e.g. "HB" |
| created_at, updated_at | timestamptz | |

#### `campaigns`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name, description | | |
| status | enum | Active, Draft, Completed, Paused |
| start_date, end_date | date | |
| created_at, updated_at | timestamptz | |

#### `leads`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| first_name, last_name, full_name | | |
| phone, email, city | | |
| campaign_id | UUID | FK → campaigns |
| assigned_agent_id | UUID | FK → users, nullable |
| status | enum | New, In Progress, Callback, … |
| priority | enum | High, Medium, Low |
| last_contact | timestamptz | |
| tags | text[] | |
| created_at, updated_at | timestamptz | |

#### `lead_notes`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| lead_id | UUID | FK, cascade delete |
| content | text | |
| author_id | UUID | FK → users |
| created_at | timestamptz | |

#### `notifications`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | nullable = broadcast |
| title, description | | |
| type | enum | system, lead, campaign |
| is_read | boolean | |
| created_at | timestamptz | |

#### `tasks`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK |
| title | text | |
| done | boolean | |
| priority | enum | high, medium, low |
| due_date | varchar | display string |
| created_at, updated_at | timestamptz | |

#### `import_jobs`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | who ran import |
| filename | varchar | |
| total_rows, imported, errors, warnings | integer | |
| status | enum | Succès, Partiel, Échec |
| created_at | timestamptz | |

### 7.3 Drizzle commands

```bash
cd backend

npm run db:push      # Push schema to Neon (dev)
npm run db:generate  # Generate SQL migrations
npm run db:migrate   # Run migrations
npm run db:seed      # Seed demo data
npm run db:setup     # push + seed
npm run db:test      # Test DB connection
```

Schema source of truth: `backend/src/db/schema.ts`.

---

## 8. Backend API Reference

**Base URL:** `http://localhost:3001/api`  
**Auth header:** `Authorization: Bearer <jwt_token>`

### Response format

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": { "limit": ["Number must be less than or equal to 100"] }
}
```

### 8.1 Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | `{ status: "ok", timestamp }` |

---

### 8.2 Auth — `/api/auth`

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/login` | No | `{ email, password }` | Returns `{ token, user }` |
| POST | `/quick-login` | No | `{ role: "Admin" \| "Supervisor" \| "Agent" }` | Demo login by role |
| GET | `/me` | Yes | — | Current user profile |
| POST | `/logout` | Yes | — | Sets `is_online = false` |

**JWT payload:**

```json
{
  "sub": "<user-uuid>",
  "email": "agent1@prolead.com",
  "role": "Agent"
}
```

---

### 8.3 Leads — `/api/leads`

All routes require authentication.

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | All | List leads (filtered, paginated) |
| GET | `/:id` | All* | Single lead with notes |
| POST | `/` | Admin, Supervisor | Create lead |
| PATCH | `/:id` | All* | Update status, priority, assignment |
| DELETE | `/:id` | Admin, Supervisor | Delete lead |
| POST | `/:id/notes` | All* | Add note |
| POST | `/bulk-assign` | Admin, Supervisor | Assign many leads to agent |

\*Agents can only access/update leads where `assigned_agent_id = their user id`.

#### GET `/api/leads` — Query parameters

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `search` | string | — | — | Search name, phone, email (ILIKE) |
| `status` | LeadStatus | — | — | Filter by status |
| `campaignId` | UUID | — | — | Filter by campaign |
| `priority` | High/Medium/Low | — | — | Filter by priority |
| `assignedAgentId` | UUID | — | — | Admin/Supervisor only |
| `page` | number | 1 | — | Page number |
| `limit` | number | 20 | **100** | Page size |
| `sortBy` | enum | lastContact | — | fullName, city, status, priority, lastContact, campaignName |
| `sortDir` | asc/desc | desc | — | Sort direction |

**Agent scope:** Agents always see only their assigned leads (server-enforced).

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [ /* Lead[] */ ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

#### PATCH `/api/leads/:id` — Body

```json
{
  "status": "Converted",
  "priority": "High",
  "assignedAgentId": "uuid-or-null"
}
```

---

### 8.4 Agents — `/api/agents`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | All | List agents with stats |
| GET | `/:id` | All | Single agent + stats |

Stats include: `assignedLeads`, `converted`, `conversionRate`, `todaysCalls`.

---

### 8.5 Campaigns — `/api/campaigns`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | All | List campaigns with stats |
| GET | `/:id` | All | Single campaign |
| POST | `/` | Admin, Supervisor | Create |
| PATCH | `/:id` | Admin, Supervisor | Update |
| DELETE | `/:id` | Admin | Delete |

---

### 8.6 Notifications — `/api/notifications`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | User's notifications (+ global where user_id is null) |
| PATCH | `/:id/read` | Mark one read |
| POST | `/read-all` | Mark all read |
| DELETE | `/:id` | Delete one |

---

### 8.7 Tasks — `/api/tasks`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Current user's tasks |
| POST | `/` | Create task |
| PATCH | `/:id` | Update (title, done, priority, dueDate) |
| DELETE | `/:id` | Delete task |

---

### 8.8 Analytics — `/api/analytics`

| Method | Path | Roles | Query | Description |
|--------|------|-------|-------|-------------|
| GET | `/dashboard` | Admin, Supervisor | `?days=30` (7–180) | Full analytics payload |

**Response includes:**

- `summary` — totalLeads, converted, conversionRate, activeAgents, activeCampaigns, totalCalls, avgAgentConversionRate
- `leadsEvolution` — daily new vs converted
- `conversionFunnel` — status funnel
- `campaignPerformance` — per campaign
- `agentPerformance` — per agent
- `dailyActivity` — calls/activity chart
- `leadsBySource` — breakdown

---

### 8.9 Imports — `/api/imports`

**Roles:** Admin, Supervisor only.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/history` | Past import jobs |
| GET | `/template` | Download CSV template file |
| POST | `/preview` | Validate rows before import |
| POST | `/` | Execute import |

#### POST `/preview` — Body

```json
{
  "rows": [
    { "first_name": "Jean", "last_name": "Dupont", "phone": "+212...", "email": "...", "city": "Casablanca" }
  ]
}
```

Auto-maps columns: `firstName`, `lastName`, `phone`, `email`, `city` (and aliases).

#### POST `/` — Body

```json
{
  "filename": "leads-may.csv",
  "campaignId": "uuid",
  "rows": [ /* same as preview */ ]
}
```

Imported leads are created with `status: New`, `priority: Medium`, **no agent assigned** until a supervisor assigns them.

---

### 8.10 Users — `/api/users`

**Roles:** Admin only (user CRUD).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all users |
| GET | `/:id` | Get user |
| POST | `/` | Create user (password required) |
| PATCH | `/:id` | Update user |
| DELETE | `/:id` | Delete user (cannot delete self) |

---

## 9. Authentication & Authorization

### 9.1 Login flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant DB as PostgreSQL

    U->>F: email + password
    F->>A: POST /auth/login
    A->>DB: find user, bcrypt compare
    A->>F: { token, user }
    F->>F: localStorage token + user
    F->>U: redirect to ROLE_HOME
```

**Storage:**

- Token: `localStorage` key `prolead_token`
- User: `localStorage` key `prolead_auth` (JSON)

### 9.2 Route protection (frontend)

Defined in `src/hooks/useAuth.ts`:

| Role | Home route | Allowed paths |
|------|------------|---------------|
| Admin | `/dashboard` | `*` (all) |
| Supervisor | `/dashboard` | dashboard, leads, campaigns, agents, analytics, notifications |
| Agent | `/workspace` | workspace, leads, tasks, notifications |

`App.tsx` uses:

- `AuthGuard` — redirects to `/login` if no token
- `RoleGuard` — shows `AccessDeniedPage` if path not allowed
- `ProtectedRoute` — combines both + `DashboardLayout`

### 9.3 API protection (backend)

- `authenticate` — verifies JWT, sets `req.user`
- `requireRoles("Admin", ...)` — checks `req.user.role`

### 9.4 Lead data isolation (agents)

In `leads.service.ts`, agents are restricted with:

```typescript
eq(leads.assignedAgentId, currentUser.sub)
```

This applies to **list**, **get**, **update**, and **notes**. Agents cannot create, delete, or bulk-assign leads.

---

## 10. Frontend Architecture

### 10.1 Entry & providers

`src/main.tsx` → `App.tsx` wraps:

1. `ThemeProvider` (dark/light)
2. `QueryClientProvider` (TanStack Query)
3. `AppProvider` (global store)
4. `WouterRouter` (routes)
5. `Toaster` (Sonner)

### 10.2 API client (`src/lib/api.ts`)

```typescript
api.get<T>(path)
api.post<T>(path, data?)
api.patch<T>(path, data?)
api.delete<T>(path)
downloadFile(path, filename)  // for CSV template
```

- Reads JWT from `prolead_token`
- Unwraps `response.data` automatically
- Throws `ApiError` on failure

### 10.3 React Query hooks (`src/hooks/useAppData.ts`)

| Hook | Endpoint | Purpose |
|------|----------|---------|
| `useLeads()` | GET /leads?limit=100 | Global store cache |
| `useLeadsList(params)` | GET /leads?... | Leads page with filters |
| `useAgents()` | GET /agents | Agent list |
| `useCampaigns()` | GET /campaigns | Campaign list |
| `useNotifications()` | GET /notifications | Notifications |
| `useTasks()` | GET /tasks | Tasks |
| `useAnalytics(days)` | GET /analytics/dashboard | Charts |
| `useImportHistory()` | GET /imports/history | Import page |
| `useImportPreview()` | POST /imports/preview | CSV validation |
| `useExecuteImport()` | POST /imports | Run import |
| `useUsers()` / CRUD | /users | Admin user management |

Mutations invalidate `queryKey: ["leads"]` to refresh lists.

### 10.4 Global store (`src/store/appStore.tsx`)

Syncs React Query results into React state for components that read `useAppStore()`:

- `leads`, `agents`, `campaigns`, `notifications`
- `sidebarCollapsed`, `unreadCount`, `refetchAll()`

### 10.5 Key components

| Component | Path | Role |
|-----------|------|------|
| `DashboardLayout` | `components/layout/` | Sidebar + Topbar + main |
| `Sidebar` | | Role-based navigation |
| `LeadDrawer` | `components/leads/` | Lead detail side panel |
| `UserFormDialog` | `components/admin/` | Create/edit users |
| `StatCard` | `components/shared/` | KPI cards |
| `PageTransition` | | Framer Motion page wrapper |

---

## 11. Pages & Features by Role

| Page | Path | Admin | Supervisor | Agent | Description |
|------|------|:-----:|:------------:|:-----:|-------------|
| Login | `/login` | ✓ | ✓ | ✓ | Public |
| Dashboard | `/dashboard` | ✓ | ✓ | — | KPIs + charts (API analytics) |
| Leads | `/leads` | ✓ | ✓ | ✓* | Table/kanban, backend filters |
| Workspace | `/workspace` | ✓ | — | ✓ | Agent call workspace |
| Campaigns | `/campaigns` | ✓ | ✓ | — | Campaign CRUD |
| Agents | `/agents` | ✓ | ✓ | — | Agent list + Admin user CRUD |
| Assignments | `/assignments` | ✓ | — | — | Bulk lead assignment UI |
| Analytics | `/analytics` | ✓ | ✓ | — | Detailed analytics |
| Import CSV | `/import` | ✓ | ✓ | — | 5-step import wizard |
| Tasks | `/tasks` | ✓ | — | ✓ | Personal tasks |
| Notifications | `/notifications` | ✓ | ✓ | ✓ | Notification center |
| Settings | `/settings` | ✓ | — | — | App settings (UI) |

\*Agent sees **only assigned leads** (backend-filtered).

### Import CSV workflow (5 steps)

1. **Upload** — drag & drop `.csv`
2. **Mapping** — auto-detect columns
3. **Validate** — `POST /imports/preview`, pick campaign
4. **Progress** — `POST /imports`
5. **Success** — shows imported/skipped/errors + history table

---

## 12. Data Flow Examples

### 12.1 Leads page with filters

```mermaid
sequenceDiagram
    participant LP as LeadsPage
    participant RQ as useLeadsList
    participant API as GET /api/leads
    participant SVC as leads.service

    LP->>LP: user types search (debounce 300ms)
    LP->>RQ: { search, status, page, limit: 20 }
    RQ->>API: /leads?search=...&page=1&limit=20
    API->>SVC: buildWhere + scope (Agent?)
    SVC-->>API: { items, total, page, limit }
    API-->>RQ: data
    RQ-->>LP: render table + pagination
```

### 12.2 Agent updates lead status

1. User clicks status in `LeadDrawer` or dropdown.
2. `useLeadActions.updateStatus()` optimistically updates local store.
3. `PATCH /api/leads/:id` with `{ status }`.
4. On success, React Query invalidates `["leads"]`.
5. Lists refresh from server.

### 12.3 CSV import

1. Frontend parses CSV with `src/lib/csv.ts`.
2. Preview → `POST /imports/preview`.
3. Execute → `POST /imports` with `campaignId`.
4. Backend inserts leads (no `assignedAgentId`).
5. Creates `import_jobs` record + notification.
6. Supervisors assign leads via Assignments or bulk-assign.

---

## 13. CI/CD & Git Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `dev` | **Default** — daily development |
| `main` | Production / stable releases |

```bash
# Work on dev
git checkout dev
git add .
git commit -m "feat: your change"
git push origin dev

# Release to production
git checkout main
git merge dev
git push origin main
```

Set **default branch** on GitHub: **Settings → General → Default branch → `dev`**.

### CI (`.github/workflows/ci.yml`)

Runs on:

- **Push** to `dev`
- **Pull request** to `dev` or `main`

Jobs:

1. **Frontend** — `npm ci`, `typecheck`, `build`
2. **Backend** — `npm ci` in `backend/`, `tsc`, `build`

---

## 14. Development Guide

### Scripts (root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend dev server |
| `npm run dev:backend` | Backend dev server |
| `npm run dev:all` | Both (parallel) |
| `npm run build` | Build frontend |
| `npm run typecheck` | Frontend TS check |
| `npm run db:setup` | Push schema + seed |

### Scripts (backend)

| Command | Description |
|---------|-------------|
| `npm run dev` | tsx watch |
| `npm run build` | Compile to `dist/` |
| `npm run start` | Run compiled JS |

### Adding a new API module

1. Create `backend/src/modules/foo/` (routes, controller, service, schema).
2. Register in `backend/src/routes/index.ts`.
3. Add types to `src/lib/api-types.ts`.
4. Add hook in `src/hooks/useAppData.ts`.
5. Build UI page or wire existing page.

### Adding a new page

1. Create `src/pages/FooPage.tsx`.
2. Add route in `src/App.tsx` inside `ProtectedRoute`.
3. Add path to `ROLE_ROUTES` in `useAuth.ts` if role-restricted.
4. Add nav item in `Sidebar.tsx` `NAV_BY_ROLE`.

### Code style

- **ESM** imports with `.js` extension in backend compiled output
- **Zod** for all API input validation
- **Thin controllers**, logic in services
- **French UI** labels (product language)

---

## 15. Troubleshooting

### `Permission denied (publickey)` on git push

Use SSH host alias `github-personal` (see README) or HTTPS with PAT.

### `relation "users" does not exist`

Run `npm run db:setup` from project root.

### API returns `Validation failed` on `/leads?limit=500`

Max `limit` is **100**. Frontend uses `limit=100` for global cache and `20` for paginated list.

### Agent sees 0 leads after import

CSV imports create leads **without** `assigned_agent_id`. Supervisor must assign leads to agents.

### Agent sees all leads (not filtered)

- Confirm logged-in user role is `Agent` in JWT (`/auth/me`).
- Log out and log in again to refresh token.
- Check Network tab: `GET /leads` should return only assigned leads.

### `EADDRINUSE :3001`

Another process uses port 3001:

```bash
lsof -i :3001
kill -9 <PID>
```

### CORS errors

Ensure `CORS_ORIGIN` in `backend/.env` matches frontend URL (e.g. `http://localhost:5173`).

### Neon connection fails

- Verify `DATABASE_URL` password and host.
- Use pooled connection string from Neon dashboard.
- Run `cd backend && npm run db:test`.

---

## 16. Appendix

### 16.1 Demo users (after seed)

| Email | Role | Name |
|-------|------|------|
| admin@prolead.com | Admin | Tarik Mansour |
| supervisor1@prolead.com | Supervisor | Karim Bennani |
| supervisor2@prolead.com | Supervisor | Mounia Lahlou |
| agent1@prolead.com | Agent | Hiba Berrada |
| agent2@prolead.com | Agent | Anas Filali |
| agent3@prolead.com | Agent | Layla Bensaid |

Password for all: **`prolead123`**

### 16.2 Lead statuses

| Status | Meaning |
|--------|---------|
| New | Just imported/created |
| In Progress | Being worked |
| Callback | Scheduled callback |
| Interested | Positive signal |
| Converted | Won |
| Not Interested | Declined |
| No Answer | Could not reach |
| Invalid Number | Bad phone data |

### 16.3 File map — pages → API

| Page | Primary APIs |
|------|----------------|
| LoginPage | POST /auth/login, /auth/quick-login |
| DashboardPage | GET /analytics/dashboard, cached leads/agents |
| LeadsPage | GET /leads?filters, PATCH /leads/:id |
| WorkspacePage | GET /leads (assigned), PATCH /leads/:id |
| CampaignsPage | GET/POST/PATCH /campaigns |
| AgentsPage | GET /agents, GET/POST/PATCH/DELETE /users |
| AssignmentsPage | GET /leads, POST /leads/bulk-assign |
| AnalyticsPage | GET /analytics/dashboard?days=N |
| ImportPage | GET /imports/*, POST /imports/* |
| TasksPage | GET/POST/PATCH/DELETE /tasks |
| NotificationsPage | GET/PATCH/DELETE /notifications |

### 16.4 Security notes for production

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use HTTPS everywhere
- [ ] Restrict `CORS_ORIGIN` to your domain
- [ ] Remove or protect `/auth/quick-login`
- [ ] Rate-limit auth endpoints
- [ ] Do not commit `backend/.env`
- [ ] Rotate Neon credentials periodically

### 16.5 Related files

- Quick start: [README.md](./README.md)
- CI config: [.github/workflows/ci.yml](./.github/workflows/ci.yml)
- DB schema: [backend/src/db/schema.ts](./backend/src/db/schema.ts)
- Auth & roles: [src/hooks/useAuth.ts](./src/hooks/useAuth.ts)

---

*Last updated: May 2026 — ProLead CRM/ERP*
