console.log('Starting requires...');
try {
    require('dotenv').config();
    console.log('dotenv loaded');
    require('./src/models/db');
    console.log('db loaded');
    require('./src/models/game');
    console.log('game loaded');
    require('./server');
    console.log('server loaded');
    process.exit(0);
} catch (e) {
    console.error(e);
    process.exit(1);
}
