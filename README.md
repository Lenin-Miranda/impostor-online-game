# ⚽ Impostor Fútbol Online

Juego del impostor (temática fútbol) para jugar con amigos. Monorepo con:

- **`frontend/`** — Next.js 15 (App Router, TypeScript, Tailwind v4)
- **`backend/`** — NestJS 11 + cliente de Supabase
- **`docker-compose.yml`** — levanta frontend + backend en local
- **Supabase** — base de datos / auth, vía la CLI de Supabase (corre en Docker)

> Esto es solo el **setup inicial**: una landing del frontend que comprueba la
> conexión con el backend (`/api/health`) y los módulos base listos para
> empezar a construir la lógica del juego.

## Requisitos

- [Docker](https://www.docker.com/) + Docker Compose
- [Node.js](https://nodejs.org/) 20+ (para la CLI de Supabase y comandos locales)

## Estructura

```
impostor-futbol-online/
├── docker-compose.yml      # orquesta frontend + backend
├── .env.example            # variables compartidas (copiar a .env)
├── frontend/               # Next.js
└── backend/                # NestJS + Supabase
```

## Puesta en marcha

### 1. Levantar Supabase en local (opcional pero recomendado)

La CLI de Supabase arranca su propio stack en Docker (Postgres, Auth, Studio…):

```bash
npx supabase init    # solo la primera vez, genera la carpeta supabase/
npx supabase start   # imprime API URL, anon key y service_role key
```

Apunta las claves que imprime: las necesitas para el `.env`.
Studio queda en http://localhost:54323.

> Si prefieres usar un proyecto **Supabase Cloud**, omite este paso y usa la
> URL y claves de tu proyecto en el dashboard.

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Rellena en `.env` los valores con las claves de Supabase del paso anterior.

### 3. Levantar la app con Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001/api/health

El código está montado como volumen, así que el **hot-reload** funciona en
ambos servicios al editar archivos.

## Desarrollo sin Docker (alternativa)

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend (en otra terminal)
cd frontend && npm install && npm run dev
```

## Próximos pasos sugeridos

- Crear las tablas del juego (salas, jugadores, rondas) en Supabase.
- Añadir realtime de Supabase para sincronizar a los jugadores.
- Implementar la lógica de partida en el backend (módulo `game`).
