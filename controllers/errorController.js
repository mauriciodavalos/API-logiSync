const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.originalError.path}: ${err.originalError.value}`;
  if (err.originalError.name === 'CastError') {
    return new AppError(message, 400);
  }
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

    if (error.originalError && error.originalError.name === 'CastError') {
      error = handleCastErrorDB(error);

      sendErrorProd(error, res);
    } else {
      sendErrorProd(err, res);
    }
  }
};

module.exports = globalErrorHandler;
