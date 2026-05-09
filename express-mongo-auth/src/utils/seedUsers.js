import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';
import bcrypt from 'bcrypt';

export default async function seedUsers() {
    // Comprueba si ya existe el usuario admin por email
    const existingAdmin = await userRepository.findByEmail('admin@example.com');
    const adminRole = await roleRepository.findByName('admin') || await roleRepository.create({ name: 'admin' });

    if (existingAdmin) {
        // Asegurar que el admin tiene el rol `admin`
        const hasAdminRole = (existingAdmin.roles || []).some(r => r.name === 'admin');
        if (!hasAdminRole) {
            existingAdmin.roles = [...new Set([...(existingAdmin.roles || []).map(r => r._id), adminRole._id])];
            await userRepository.update(existingAdmin._id, { roles: existingAdmin.roles });
            console.log('Added admin role to existing admin user.');
        } else {
            console.log('Admin user already exists with admin role.');
        }
        return;
    }

    // Crear usuario admin por defecto (idempotente)
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
    const hashed = await bcrypt.hash('Admin#123', saltRounds);

    try {
        await userRepository.create({
            email: 'admin@example.com',
            password: hashed,
            name: 'Admin',
            lastName: 'Default',
            phoneNumber: '000000000',
            birthdate: new Date('1990-01-01'),
            url_profile: '',
            address: '',
            roles: [adminRole._id]
        });
        console.log('Seeded admin user: admin@example.com / Admin#123');
    } catch (err) {
        console.error('Error seeding admin user:', err.message || err);
    }
}
