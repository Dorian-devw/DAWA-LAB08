import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';

class AuthService {

    async signUp({ email, password, name, lastName, phoneNumber, birthdate, url_profile, address }) {
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            const err = new Error('El email ya se encuentra en uso');
            err.status = 400;
            throw err;
        }

        if (typeof password !== 'string' || password.length < 8) {
            const err = new Error('El password debe tener al menos 8 caracteres');
            err.status = 400;
            throw err;
        }
        if (!/(?=.*[A-Z])(?=.*\d)(?=.*[#\$%&\*@])/.test(password)) {
            const err = new Error('El password debe contener al menos una mayúscula, un dígito y un caracter especial (# $ % & * @)');
            err.status = 400;
            throw err;
        }

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
        const hashed = await bcrypt.hash(password, saltRounds);

        // Forzar rol por defecto 'user' al registrar (no permitir crear admin desde signup)
        const defaultRoleName = 'user';
        let roleDoc = await roleRepository.findByName(defaultRoleName);
        if (!roleDoc) roleDoc = await roleRepository.create({ name: defaultRoleName });
        const roleDocs = [roleDoc._id];

        const user = await userRepository.create({
            email,
            password: hashed,
            name,
            lastName,
            phoneNumber,
            birthdate,
            url_profile,
            address,
            roles: roleDocs
        });

        return {
                id: user._id,
                email: user.email,
                name: user.name
            };
    }

    async signIn({ email, password }) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            const err = new Error('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            const err = new Error('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        const token = jwt.sign({ 
            sub: user._id, 
            roles: user.roles.map(r => r.name) }, 
            process.env.JWT_SECRET, 
            { 
                expiresIn: process.env.JWT_EXPIRES_IN || '1h' 
            }
        );

        return { token };
    }
}

export default new AuthService();
