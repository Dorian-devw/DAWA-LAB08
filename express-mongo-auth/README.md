# express-mongo-auth

Proyecto `express-mongo-auth` (Lab07) — preparado para despliegue en MongoDB Atlas y Render.

Configuración rápida

- Copia `.env.example` a `.env` y completa `MONGO_URI` con tu conexión de Atlas.
- Opcional: configura `RENDER_SERVICE_ID` y `RENDER_API_KEY` en los secretos del repositorio para despliegues automáticos.

Comandos

```powershell
npm install
node src/server.js
```

CI / Deploy

- CI básico: `.github/workflows/ci.yml` instala dependencias.
- Deploy manual: `.github/workflows/deploy-to-render.yml` usa `workflow_dispatch` y requiere los secretos `RENDER_SERVICE_ID` y `RENDER_API_KEY`.
- Plantilla para Render: `render.yaml`.
