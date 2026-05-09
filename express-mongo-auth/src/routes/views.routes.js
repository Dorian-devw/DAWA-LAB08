import express from 'express';
const router = express.Router();

router.get('/signIn', (req, res) => res.render('signIn'));
router.get('/signUp', (req, res) => res.render('signUp'));
router.get('/profile', (req, res) => res.render('profile'));
router.get('/dashboard', (req, res) => res.render('dashboard-user'));
router.get('/admin', (req, res) => res.render('dashboard-admin'));
router.get('/admin/user/:id', (req, res) => res.render('admin-user'));
router.get('/403', (req, res) => res.render('403'));

router.get('/', (req, res) => res.redirect('/signIn'));

// 404 
router.use((req, res) => res.status(404).render('404'));

export default router;
