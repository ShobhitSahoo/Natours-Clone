const AppError = require('./../Utils/appError');

const handleCastErrorDB = (err, req) => {
  const message = `Invalid ${err.path}: ${req.params.id}`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another field name`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid inpur data. ${errors.join('.\n')}`;
  return new AppError(message, 400);
}

const handleJWTError = err => {
  return new AppError('Invalid token. Please log in again!', 401);
}

const handleJWTExpiredError = err => {
  return new AppError('Your token has expired. Please log in again', 401);
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

const sendErrorProd = (err, res) => {
  if(err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('Error', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!!'
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if(process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);

  } else if(process.env.NODE_ENV === 'production') {
    let error = {...err};
    if(error.name === 'CastError') error = handleCastErrorDB(error, req);
    
    if(error.code === 11000) error = handleDuplicateFieldsDB(error);

    if(error.name === 'ValidationError') error = handleValidationErrorDB(error);

    if(error.name === 'JsonWebTokenError') error = handleJWTError(err);

    if(error.name === 'TokenExpiredError') error = handleJWTExpiredError(err);
    // console.log("err=", err, "error", error);
    sendErrorProd(error, res);
  }
}