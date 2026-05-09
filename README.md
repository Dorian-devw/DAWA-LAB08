# Laboratorio 07 — Express + MongoDB + autenticación JWT

Proyecto **express-mongo-auth** para el curso **DAWA** (Desarrollo de Aplicaciones Web Avanzada): API REST con **Node.js**, **Express**, **MongoDB / Mongoose**, **JWT**, **bcrypt** y un frontend ligero en **EJS + Materialize** con tema visual **retro tipo sistema operativo clásico** (escritorio negro, ventana centrada, barra de tareas).

---

## Qué se implementó en el laboratorio

### Backend

- **Servidor Express** (ES Modules) con **CORS**, **JSON body parser** y **archivos estáticos** desde `public/`.
- **Conexión a MongoDB** con Mongoose; el servidor solo arranca rutas completas tras conectar correctamente.
- **Modelos**: `User` (email único, contraseña hasheada, datos de perfil, referencias a roles) y `Role` (nombre del rol).
- **Virtual `age`** en el esquema de usuario calculado a partir de `birthdate`.
- **Capas**: rutas → controladores → servicios → repositorios (separación de responsabilidades).
- **Autenticación**:
  - Registro (`signUp`) con validación de contraseña (longitud mínima, mayúscula, dígito y carácter especial permitido).
  - Login (`signIn`) que devuelve un **JWT** con `sub` (id de usuario) y `roles` (nombres de roles).
  - Middleware **`authenticate`**: valida el header `Authorization: Bearer <token>`.
  - Middleware **`authorize`**: comprueba que el usuario tenga alguno de los roles requeridos (lista vacía = cualquier usuario autenticado).
- **Usuarios**:
  - Usuario normal: lectura y actualización del propio perfil (`GET/PUT /api/users/me`).
  - Administrador: listado de usuarios, lectura y actualización por id (incluye asignación de **un rol** mediante radiobuttons en la vista admin).
- **Roles**: endpoint `GET /api/roles` protegido para administradores (lista de nombres de rol para el formulario de edición).
- **Semillas (`seed`)**: al iniciar, si no hay datos base se crean roles `user` y `admin`; si no existe ningún admin, se crea un usuario administrador por defecto (ver credenciales más abajo).
- **Salud del servidor**: `GET /health` devuelve `{ ok: true }`.
- **Vistas**: rutas HTML que renderizan plantillas **EJS** (login, registro, perfil, dashboards, administración de usuario, errores 403/404).

### Frontend (interfaz)

- **Materialize CSS 1.x** (CDN) como base de rejilla y componentes.
- **Tema personalizado** `public/css/retro-os-ui.css`:
  - Escritorio **fondo negro** y **ventana centrada** con bisel tipo interfaz clásica.
  - Barra superior azul con marca **APP.EXE**, enlaces de navegación y botones decorativos de ventana.
  - Área de contenido gris con líneas sutiles tipo pantalla retro.
  - **Barra de tareas fija inferior** en **gris plata** (alineado con estilo Win9x / botón Start), bandeja con reloj y botón Start como imagen `public/images/start-button.png`.
- **JavaScript del cliente** (`public/js/auth.js`, `public/js/profile.js`): login/registro contra la API, guardado del token en **`sessionStorage`**, navegación condicional según token y rol, carga de datos en perfil/dashboard/admin.

---

## Stack tecnológico

| Área        | Tecnología                          |
|-------------|-------------------------------------|
| Runtime     | Node.js (ES Modules)                |
| Servidor    | Express 4                           |
| Base de datos | MongoDB + Mongoose 7              |
| Seguridad   | bcrypt, jsonwebtoken                |
| Vistas      | EJS                                 |
| UI base     | Materialize CSS                     |
| Herramientas| nodemon (desarrollo), dotenv        |

---

## Estructura del proyecto (resumen)

```
express-mongo-auth/
├── public/
│   ├── css/retro-os-ui.css      # Tema retro / ventana / barra de tareas
│   ├── js/auth.js               # Login, signup, navegación según token
│   ├── js/profile.js            # Perfil, dashboards, admin (fetch API)
│   └── images/start-button.png  # Imagen del botón Start (añádela si falta)
├── src/
│   ├── controllers/             # AuthController, UserController
│   ├── middlewares/             # authenticate.js, authorize.js
│   ├── models/                  # User.js, Role.js
│   ├── repositories/            # Acceso a datos (User, Role)
│   ├── routes/                  # auth, users, roles, views
│   ├── services/                # AuthService, UserService
│   ├── utils/                   # seedRoles.js, seedUsers.js
│   ├── views/                   # Plantillas EJS + _header / _footer
│   └── server.js                # Punto de entrada
├── .env                         # Variables de entorno (no commitear secretos)
├── package.json
└── README.md
```

---

## Variables de entorno

Crear un archivo **`.env`** en la raíz (puedes partir de estos nombres; ajusta valores en local):

| Variable            | Descripción |
|---------------------|-------------|
| `MONGODB_URI`       | Cadena de conexión a MongoDB. |
| `JWT_SECRET`        | Secreto para firmar y verificar tokens JWT. |
| `JWT_EXPIRES_IN`    | (Opcional) Duración del token, p. ej. `1h`. |
| `BCRYPT_SALT_ROUNDS`| (Opcional) Rondas de bcrypt; por defecto `10`. |
| `PORT`              | (Opcional) Puerto del servidor; por defecto `3000`. |

---

## Instalación y ejecución

```bash
npm install
```

Desarrollo (recarga al cambiar archivos en `src/`):

```bash
npm run dev
```

Producción:

```bash
npm start
```

Abrir en el navegador la URL indicada en consola (por defecto `http://localhost:3000`). La ruta `/` redirige a `/signIn`.

---

## Datos semilla (admin por defecto)

Si la base no tiene ningún usuario con rol **admin**, el arranque crea uno:

- **Email:** `admin@example.com`  
- **Contraseña:** `Admin#123`  

Los roles **`user`** y **`admin`** se crean si la colección de roles está vacía.

---

## Rutas de vistas (HTML)

| Ruta               | Descripción |
|--------------------|-------------|
| `/signIn`          | Inicio de sesión |
| `/signUp`          | Registro |
| `/profile`         | Perfil editable (requiere sesión/token en cliente) |
| `/dashboard`       | Dashboard de usuario |
| `/admin`           | Listado de usuarios (solo admin en API; la vista debe usarse con token admin) |
| `/admin/user/:id`  | Edición de usuario y rol (admin) |
| `/403`             | Acceso denegado |
| Cualquier otra     | Plantilla **404** |

La protección **real** está en la **API** (JWT + roles); las vistas son páginas estáticas renderizadas en servidor que el cliente enriquece con `fetch` y `sessionStorage`.

---

## API REST (resumen)

| Método y ruta | Autenticación | Rol | Descripción |
|---------------|---------------|-----|-------------|
| `POST /api/auth/signUp` | No | — | Registro |
| `POST /api/auth/signIn` | No | — | Login → `{ token }` |
| `GET /api/users/me` | Bearer | Cualquiera | Perfil actual |
| `PUT /api/users/me` | Bearer | Cualquiera | Actualizar perfil |
| `GET /api/users` | Bearer | **admin** | Listar usuarios |
| `GET /api/users/:id` | Bearer | **admin** | Detalle usuario |
| `PUT /api/users/:id` | Bearer | **admin** | Actualizar usuario y roles |
| `GET /api/roles` | Bearer | **admin** | Lista de nombres de rol |
| `GET /health` | No | — | Estado del servidor |

---

## Notas sobre el tema visual

- El botón **Start** usa la imagen **`/images/start-button.png`**. Si no aparece, crea la carpeta `public/images/` y coloca ahí el archivo con ese nombre (o cambia la ruta en `_footer.ejs`).
- La barra de tareas usa variables CSS `--taskbar-gray-*` en `retro-os-ui.css` por si necesitas igualar el gris al de tu PNG.

---

## Autor

**earevalo** — proyecto **express-mongo-auth** · Laboratorio DAWA (Lab 07).
