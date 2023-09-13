class AppError extends Error {
  constructor(message, statusCode, originalError) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.originalError = originalError;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
