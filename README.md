# ⚽ Impostor Fútbol Online

Juego del impostor (temática fútbol) para jugar con amigos. Monorepo con:

- **`frontend/`** — Next.js 15 (App Router, TypeScript, Tailwind v4)
- **`backend/`** — NestJS 11 + cliente de Supabase
- **`docker-compose.yml`** — levanta frontend + backend en local
- **Supabase** — base de datos / auth, vía la CLI de Supabase (corre en Docker)

> **Estado actual:** juego jugable de principio a fin. Crear/unirse a una sala,
> lobby en tiempo real (WebSockets), reparto de roles (el crew ve al jugador
> secreto, el impostor solo una pista), votación, resultado con puntuación y
> rondas múltiples hasta terminar la partida.

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

## Deudas técnicas conocidas

- **Conteo de votos no atómico.** El disparador de "ya votaron todos" tiene una
  carrera teórica si dos votos llegan en el mismo milisegundo (con jugadores
  humanos no ocurre). Hardening futuro: hacerlo atómico con una función o
  trigger de Postgres.
- **Reconexión a mitad de partida.** Si recargas durante una ronda ves
  "reconectando": todavía no reenviamos el rol ni la fase al reconectar.
- **Ajustes del lobby no persistidos.** La configuración del anfitrión
  (impostores, categoría, tiempo…) vive en el frontend; falta un endpoint
  `PATCH /rooms/:code/settings` que la guarde y la sincronice por socket.

## Roadmap

- Robustez: reconexión, manejar que un jugador o el anfitrión se vaya (reasignar host).
- Usar la `category` de los ajustes en el reparto (hoy el backend la ignora).
- Auth: token JWT por jugador + guard de anfitrión en el gateway.
- Deploy: Vercel (frontend) + host del backend (Render/Fly) + Supabase Cloud.
