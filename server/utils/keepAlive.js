const mongoose = require('mongoose');

/**
 * Starts a background interval to ping the MongoDB database.
 * This prevents the connection from being closed due to inactivity 
 * (which can happen with some cloud providers or firewalls).
 */
const startKeepAlive = () => {
    // Run every 5 minutes (300,000 ms)
    // Most standard timeouts are around 30 minutes, so 5 mins is safe.
    const INTERVAL_MS = 5 * 60 * 1000;

    setInterval(async () => {
        // Only ping if connection is ready (state === 1)
        if (mongoose.connection.readyState === 1) {
            try {
                await mongoose.connection.db.admin().ping();
                console.log(`[${new Date().toISOString()}] MongoDB Keep-Alive Ping Successful`);
            } catch (err) {
                console.error(`[${new Date().toISOString()}] MongoDB Keep-Alive Ping Failed:`, err.message);
            }
        }
    }, INTERVAL_MS);
};

module.exports = startKeepAlive;
