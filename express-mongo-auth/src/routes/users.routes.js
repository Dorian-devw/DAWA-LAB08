import express from 'express';
import UserController from '../controllers/UserController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

router.get('/', authenticate, authorize(['admin']), UserController.getAll);

router.get('/me', authenticate, authorize([]), UserController.getMe);
router.get('/:id', authenticate, authorize(['admin']), UserController.getById);
router.put('/:id', authenticate, authorize(['admin']), UserController.updateById);
router.put('/me', authenticate, authorize([]), UserController.updateMe);

export default router;
