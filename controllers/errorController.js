const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.originalError.path}: ${err.originalError.value}`;
  if (err.originalError.name === 'CastError') {
    return new AppError(message, 400, err.originalError);
  }
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.originalError.errors).map(
    (el) => `-> ${el.path} ${el.message}`
  );

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, err.originalError);
};

const handleJWTError = (err) => {
  return new AppError(
    'Invalid Token. Please login Again',
    401,
    err.originalError
  );
};

const handleJWTExpiredError = (err) => {
  return new AppError(
    'Expired Token. Please login Again',
    401,
    err.originalError
  );
};

const handleMissingAuthorizationBearer = (err) => {
  return new AppError(
    'Missing Authorization Token. Please log in Again',
    401,
    err.originalError
  );
};

const handleChangedPasswordRencently = (err) => {
  return new AppError(
    'User recently changed password!, Please log in again',
    401,
    err.originalError
  );
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //Programming or other unknown error: don´t leak error details
  } else {
    //1) log error
    console.error('Error 🧨', err);

    //2) send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    //TODO duplicate error handler

    if (error.originalError && error.originalError.name === 'CastError')
      error = handleCastErrorDB(error);

    if (error.originalError && error.originalError.name === 'JsonWebTokenError')
      error = handleJWTError(error);

    if (error.originalError && error.originalError.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);

    if (
      error.originalError &&
      error.originalError.name === 'Missing_authorization_bearer'
    )
      error = handleMissingAuthorizationBearer(error);

    if (
      error.originalError &&
      error.originalError.name === 'User_changed_password_recently'
    )
      error = handleChangedPasswordRencently(error);

    if (error.originalError && error.originalError.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;
