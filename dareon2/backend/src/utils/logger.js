const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Create the logger
const logger = winston.createLogger({
  levels,
  format: logFormat,
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console with a simpler format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
            // Print log trace
            return `${timestamp} ${level}: ${message}\n${stack}`;
          }
          return `${timestamp} ${level}: ${message}`;
        })
      ),
    })
  );
}

// Create a stream object with a write function that will be used by Morgan
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

// Helper functions for common logging patterns
logger.logAPIRequest = (req, duration) => {
  logger.info({
    type: 'API_REQUEST',
    method: req.method,
    path: req.path,
    duration: `${duration}ms`,
    userId: req.user ? req.user.id : 'anonymous',
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

logger.logError = (error, req = null) => {
  const errorLog = {
    type: 'ERROR',
    message: error.message,
    stack: error.stack,
    code: error.code || error.statusCode,
  };

  if (req) {
    errorLog.method = req.method;
    errorLog.path = req.path;
    errorLog.userId = req.user ? req.user.id : 'anonymous';
    errorLog.ip = req.ip;
  }

  logger.error(errorLog);
};

logger.logFileOperation = (operation, fileDetails, userId) => {
  logger.info({
    type: 'FILE_OPERATION',
    operation,
    fileDetails,
    userId,
  });
};

logger.logAuthEvent = (event, userId, success, details = {}) => {
  logger.info({
    type: 'AUTH_EVENT',
    event,
    userId,
    success,
    ...details,
  });
};

logger.logIntegrationEvent = (integration, event, userId, success, details = {}) => {
  logger.info({
    type: 'INTEGRATION_EVENT',
    integration,
    event,
    userId,
    success,
    ...details,
  });
};

logger.logPerformanceMetric = (metric, value, details = {}) => {
  logger.info({
    type: 'PERFORMANCE_METRIC',
    metric,
    value,
    ...details,
  });
};

// Export logger instance
module.exports = logger;
