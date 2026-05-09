import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import seedRoles from './utils/seedRoles.js';
import seedUsers from './utils/seedUsers.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, { autoIndex: true })
    .then(async () => {
        console.log('Mongo connected');
        if (process.env.SKIP_SEEDS === 'true') {
            console.log('SKIP_SEEDS=true — omitiendo seedRoles/seedUsers');
        } else {
            await seedRoles();
            await seedUsers();
        }
        app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar con Mongo:', err);
        process.exit(1);
    });
