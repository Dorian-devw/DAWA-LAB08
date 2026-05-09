import userService from '../services/UserService.js';

class UserController {

    async getAll(req, res, next) {
        try {
            const users = await userService.getAll();
            res.status(200).json(users);
        } catch (err) {
            next(err);
        }
    }

    async getMe(req, res, next) {
        try {
            const user = await userService.getById(req.userId);
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const id = req.params.id;
            const user = await userService.getById(id);
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }

    async updateById(req, res, next) {
        try {
            const id = req.params.id;
            const payload = req.body;
            const updated = await userService.updateById(id, payload);
            res.status(200).json(updated);
        } catch (err) {
            next(err);
        }
    }

    async updateMe(req, res, next) {
        try {
            const payload = req.body;
            const user = await userService.update(req.userId, payload);
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }
}

export default new UserController();
