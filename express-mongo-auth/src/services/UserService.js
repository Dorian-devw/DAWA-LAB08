import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';

class UserService {

    async getAll() {
        const users = await userRepository.getAll();
        return users.map(u => ({
            id: u._id,
            email: u.email,
            name: u.name,
            lastName: u.lastName,
            roles: (u.roles||[]).map(r => r.name),
            createdAt: u.createdAt
        }));
    }

    async getById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return {
            id: user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            birthdate: user.birthdate,
            url_profile: user.url_profile,
            address: user.address,
            createdAt: user.createdAt,
            roles: user.roles.map(r => r.name),
            age: user.age
        };
    }

    async update(id, payload) {
        const allowed = ['name','lastName','phoneNumber','birthdate','url_profile','address'];
        const data = {};
        for (const k of allowed) if (k in payload) data[k] = payload[k];

        const updated = await userRepository.update(id, data);
        if (!updated) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return {
            id: updated._id,
            email: updated.email,
            name: updated.name,
            lastName: updated.lastName,
            phoneNumber: updated.phoneNumber,
            birthdate: updated.birthdate,
            url_profile: updated.url_profile,
            address: updated.address,
            roles: updated.roles.map(r => r.name)
        };
    }

    async updateById(id, payload) {
        // Admin-level update: allow updating profile fields and roles
        const allowed = ['name','lastName','phoneNumber','birthdate','url_profile','address','roles'];
        const data = {};
        for (const k of allowed) if (k in payload) data[k] = payload[k];

        if ('roles' in payload) {
            if (!Array.isArray(data.roles) || data.roles.length !== 1) {
                const err = new Error('Debe asignarse exactamente un rol al usuario');
                err.status = 400;
                throw err;
            }
            const roleName = data.roles[0];
            let roleDoc = await roleRepository.findByName(roleName);
            if (!roleDoc) roleDoc = await roleRepository.create({ name: roleName });
            data.roles = [roleDoc._id];
        }

        const updated = await userRepository.update(id, data);
        if (!updated) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return {
            id: updated._id,
            email: updated.email,
            name: updated.name,
            lastName: updated.lastName,
            phoneNumber: updated.phoneNumber,
            birthdate: updated.birthdate,
            url_profile: updated.url_profile,
            address: updated.address,
            roles: updated.roles.map(r => r.name)
        };
    }
}

export default new UserService();
