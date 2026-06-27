# Impostor Fútbol Online

An impostor game with a soccer theme, built to play with friends. Monorepo with:

- **`frontend/`** — Next.js 15 (App Router, TypeScript, Tailwind v4)
- **`backend/`** — NestJS 11 + Supabase client
- **`docker-compose.yml`** — runs the frontend + backend locally
- **Supabase** — database / auth, via the Supabase CLI (runs in Docker)

> **Current status:** playable end to end. Create/join a room, real-time lobby
> (WebSockets), role assignment (regular players see the secret player, the
> impostor only gets a hint), voting, scored results, and multiple rounds until
> the match ends.

## Requirements

- [Docker](https://www.docker.com/) + Docker Compose
- [Node.js](https://nodejs.org/) 20+ (for the Supabase CLI and local commands)

## Structure

```
impostor-futbol-online/
├── docker-compose.yml      # orchestrates frontend + backend
├── .env.example            # shared variables (copy to .env)
├── frontend/               # Next.js
└── backend/                # NestJS + Supabase
```

## Getting Started

### 1. Start Supabase locally (optional but recommended)

The Supabase CLI starts its own Docker stack (Postgres, Auth, Studio...):

```bash
npx supabase init    # only the first time, creates the supabase/ folder
npx supabase start   # prints the API URL, anon key, and service_role key
```

Save the keys it prints: you will need them for `.env`.
Studio will be available at http://localhost:54323.

> If you prefer to use a **Supabase Cloud** project, skip this step and use your
> project URL and keys from the dashboard.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with the Supabase values from the previous step.

### 3. Start the app with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/health

The code is mounted as a volume, so **hot reload** works in both services when
you edit files.

## Development Without Docker (Alternative)

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend (in another terminal)
cd frontend && npm install && npm run dev
```

## Roadmap

- Handle a player or host leaving mid-match (reassign host).
- Use the `category` setting during role assignment (the backend currently ignores it).
- Auth: JWT token per player + host guard in the gateway.
- Deploy: Vercel (frontend) + backend host (Render/Fly) + Supabase Cloud.
