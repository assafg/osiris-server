const logger = require('pino')({ level: process.env.LOG_LEVEL || 30 });

export default logger;
