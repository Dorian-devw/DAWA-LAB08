import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import viewsRoutes from './routes/views.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Vistas y archivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));
app.use(express.static(path.join(process.cwd(), 'public')));

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', rolesRoutes);

// Rutas de vistas (frontend)
app.use('/', viewsRoutes);

// Salud del servicio
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// Handler de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

export default app;
