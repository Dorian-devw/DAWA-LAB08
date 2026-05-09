# express-mongo-auth (Lab07) — cambios para Mongo Atlas + Render

Este README resume las modificaciones realizadas para adaptar `dawa-lab07/express-mongo-auth` a despliegue con MongoDB Atlas y Render.

**Cambios principales realizados**
	- Plantilla `render.yaml` en la raíz del repo que ejecuta build/start dentro de `express-mongo-auth` (evita errores de ruta `src/src`).
	- También existe `render.yaml` dentro de `express-mongo-auth` como referencia local.
	- `.github/workflows/ci.yml`: workflow de CI básico.
	- `.github/workflows/deploy-to-render.yml`: actualizado para usar `RENDER_DEPLOY_HOOK_URL` (webhook) como secret.

**Archivos añadidos/actualizados**

Nota: evita subir archivos `.env` con credenciales al repositorio.

**Cómo desplegar en Render (resumen rápido)**
1. En Render, crea o configura el Web Service para apuntar al repo. Opciones:
	 - Establece **Root Directory** en `express-mongo-auth` (UI), o
	 - Mantén el repo raíz y usa el `render.yaml` que ejecuta `cd express-mongo-auth && ...` (ya añadido).
2. En Render → Environment, añade variables:
	 - `MONGO_URI` (ejemplo: `mongodb+srv://USER:PASS@cluster0.../lab07?retryWrites=true&w=majority`)
	 - `JWT_SECRET`
	 - `SKIP_SEEDS=true` (recomendado en producción para evitar re-seeding)
3. Si usas GitHub Actions para disparar deploys, añade el secret `RENDER_DEPLOY_HOOK_URL` en GitHub (Settings → Secrets).

**Probar localmente**
```powershell
cd "C:\Users\ACER\Desktop\dawa-lab08\dawa-lab07\express-mongo-auth"
$env:MONGO_URI="mongodb+srv://USER:PASS@cluster0.../lab07?retryWrites=true&w=majority"
$env:SKIP_SEEDS="true"
npm ci
node src/server.js
```

Comprobar salud:
```bash
curl -i https://<TU-SERVICE>.onrender.com/health
```

**Seguridad y mantenimiento**

Si quieres, puedo:

Gracias — dime qué prefieres que haga a continuación.

## Cambios principales realizados

- Separación `app` / `server`: `src/app.js` contiene la configuración de Express (rutas, vistas, estáticos) y `src/server.js` se encarga de la conexión a Mongo y de arrancar la aplicación.
- Seeds idempotentes: `src/utils/seedRoles.js` y `src/utils/seedUsers.js` sólo insertan datos si no existen.
- Variable `SKIP_SEEDS`: permite omitir el seed en despliegues (útil en producción).
- `render.yaml` añadido en la raíz para forzar build/start dentro de `express-mongo-auth` (evita errores de ruta `src/src`).
- Workflows GitHub: CI básico y workflow de deploy actualizado para usar `RENDER_DEPLOY_HOOK_URL`.

## Archivos clave

- `src/app.js` — configuración de Express (middlewares, rutas, vistas).
- `src/server.js` — conexión a Mongo (lee `MONGO_URI`/`MONGODB_URI`), arranque y ejecución de seeds (salvo `SKIP_SEEDS=true`).
- `src/utils/seedRoles.js`, `src/utils/seedUsers.js` — scripts de inicialización (ahora idempotentes).
- `render.yaml` (raíz) — instrucciones para Render (build/start dentro de `express-mongo-auth`).
- `.github/workflows/ci.yml` — CI básico.
- `.github/workflows/deploy-to-render.yml` — workflow para disparar deploy mediante `RENDER_DEPLOY_HOOK_URL`.
- `.env.example` — variables necesarias para local/dev.

## Variables de entorno (necesarias)

- `MONGO_URI` o `MONGODB_URI`: cadena de conexión Atlas. RECOMENDADO usar una DB separada: `.../lab07?retryWrites=true&w=majority`.
- `JWT_SECRET`: secreto para tokens.
- `SKIP_SEEDS`: si `true`, no se ejecutan los seeds en el arranque.

No subas `.env` al repositorio. Usa Environment Vars en Render y GitHub Secrets para workflows.

## Desarrollo local (modo desarrollo con recarga)

1. Instalar dependencias:
```powershell
cd "C:\Users\ACER\Desktop\dawa-lab08\dawa-lab07\express-mongo-auth"
npm ci
```
2. Exportar variables (PowerShell):
```powershell
$env:MONGO_URI="mongodb+srv://USER:PASS@cluster0.../lab07?retryWrites=true&w=majority"
$env:SKIP_SEEDS="true"   # opcional para evitar re-seed
$env:JWT_SECRET="tu-secreto"
```
3. Ejecutar en modo dev (recarga con nodemon):
```powershell
npm run dev
```
4. Abrir en el navegador: `http://localhost:3000/`.

Rutas útiles:
- `/` — vistas públicas (signIn/signUp según la app).
- `/health` — devuelve `{ ok: true }`.
- `/api/*` — endpoints REST (usuarios, auth, roles).

## Despliegue en Render (pasos)

1. Asegúrate de que Render use la carpeta correcta:
   - Opción A (UI): en la configuración del servicio, pon **Root Directory** = `express-mongo-auth`.
   - Opción B (ya implementada): mantener repo raíz y usar el `render.yaml` en la raíz (ejecutará `cd express-mongo-auth && npm ci`, `cd express-mongo-auth && npm run start`).
2. Añadir Environment Vars en Render:
   - `MONGO_URI` = `mongodb+srv://USER:PASS@cluster0.../lab07?retryWrites=true&w=majority`
   - `JWT_SECRET` = tu secreto
   - `SKIP_SEEDS` = `true` (recomendado en producción)
3. Ver logs en Render para confirmar que la app arranca y conecta a Mongo.

Si aparece un error `querySrv ECONNREFUSED`, comprueba Network Access en Atlas (añade la IP de Render o 0.0.0.0/0 temporalmente para pruebas).

## GitHub Actions — deploy mediante webhook

El workflow `deploy-to-render.yml` está configurado para leer el secret `RENDER_DEPLOY_HOOK_URL` y hacer un `POST` a ese webhook para disparar un deploy en Render.

En GitHub: Settings → Secrets → Actions, añade:
- `RENDER_DEPLOY_HOOK_URL` = la URL webhook de tu servicio en Render.

Nota: GitHub Actions detecta workflows solo en `.github/workflows/` en la raíz del repo. Si el workflow estuvo colocado dentro de `express-mongo-auth/.github/workflows`, debes moverlo al root.

Comando para moverlo (opcional):
```powershell
cd "C:\Users\ACER\Desktop\dawa-lab08\dawa-lab07"
mkdir -p .github\workflows
git mv express-mongo-auth\.github\workflows\deploy-to-render.yml .github\workflows\
git add .github\workflows\deploy-to-render.yml
git commit -m "Move deploy workflow to repository root"
git push
```

## Seeds y cuenta admin por defecto

- Los seeds crean por defecto `user`, `admin` y un usuario `admin@example.com` con contraseña `Admin#123` la primera vez.
- Para producción: cambia la contraseña del admin o elimina ese usuario después del primer deploy, y usa `SKIP_SEEDS=true` para evitar re-ejecuciones.

## Seguridad y limpieza del repo

- Si subiste `.env` por error, elimínalo del control de versiones:
```powershell
git rm --cached express-mongo-auth/.env
git commit -m "Remove .env from repo"
git push
```
- Mantén `MONGO_URI` y `JWT_SECRET` solo como Environment Vars en Render/GitHub.

## Pruebas rápidas

- Health check remoto:
```bash
curl -i https://<TU-SERVICE>.onrender.com/health
```
- Health check local:
```bash
curl -i http://localhost:3000/health
```

---

Si quieres, realizo cualquiera de estas acciones ahora:
- mover el workflow al root y hacer commit/push por ti,
- eliminar `.env` del repo y commitear,
- ejecutar `npm run dev` local y mostrar logs.

Dime qué prefieres y lo hago.
