import express from 'express';
import roleRepository from '../repositories/RoleRepository.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

// GET /api/roles 
router.get('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const roles = await roleRepository.getAll();
        res.status(200).json(roles.map(r => r.name));
    } catch (err) {
        next(err);
    }
});

export default router;
