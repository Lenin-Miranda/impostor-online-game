# Deploy

Arquitectura en producción:

- **Frontend** → Vercel (Next.js)
- **Backend** → Render (NestJS + WebSockets, vía `Dockerfile.prod`)
- **Base de datos** → Supabase Cloud ✅ (ya migrada con `supabase db push`)

> El backend usa WebSockets persistentes, por eso va en un host con proceso
> vivo (Render/Railway/Fly), **no** en serverless.

---

## 1. Backend en Render

1. [render.com](https://render.com) → **New → Web Service** → conecta este repo.
2. Configuración:
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Dockerfile Path:** `Dockerfile.prod`  *(relativo al Root Directory, sin `backend/`)*
   - **Health Check Path:** `/api/health`
3. **Environment** (variables):
   - `SUPABASE_URL` = `https://qplpevgxdncelqrvosoh.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = *(service_role del cloud — Settings → API)*
   - `FRONTEND_URL` = *(la URL de Vercel; se rellena en el paso 3)*
   - `NODE_ENV` = `production`
   - *(`PORT` lo inyecta Render automáticamente.)*
4. Deploy. Anota la URL pública, p.ej. `https://impostor-backend.onrender.com`.

> Render free tier "duerme" el servicio tras inactividad (la primera petición
> tarda unos segundos en despertar). Suficiente para un proyecto de portfolio.

## 2. Frontend en Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
2. **Root Directory:** `frontend`
3. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = la URL del backend de Render (paso 1).
4. Deploy. Anota la URL, p.ej. `https://impostor-futbol.vercel.app`.

## 3. Conectar CORS (cierra el círculo)

1. Vuelve a Render → variables del backend.
2. Pon `FRONTEND_URL` = la URL de Vercel del paso 2.
3. Redeploy del backend (para que el CORS acepte el origen del frontend).

## Verificar

Abre la URL de Vercel, crea una sala, únete desde otra ventana/incógnito y juega
una ronda. Revisa que el socket conecta (Network → WS en las devtools).

---

## Notas

- **Secretos:** la `service_role` solo vive en las variables de Render, nunca en
  el repo. El frontend solo conoce `NEXT_PUBLIC_API_URL` (público).
- **Railway / Fly** funcionan igual: apúntalos a `backend/Dockerfile.prod` y
  define las mismas variables de entorno.
- **Migraciones futuras:** `supabase db push` vuelve a aplicar lo nuevo al cloud.
