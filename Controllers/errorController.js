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

const sendErrorDev = (err, req, res) => {
  // API errors
  if(req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  // Rendered Website errors
  // console.error('Error', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
}

const sendErrorProd = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // console.error('Error', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!!'
    })
  }   //End of API errors if block

  // Rendered website
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
      })
    } 
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later'
    })
  }   // End of rendered website errors if block
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if(process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);

  } else if(process.env.NODE_ENV === 'production') {
    let error = {...err};
    error.message = err.message
    if(error.name === 'CastError') error = handleCastErrorDB(error, req);
    
    if(error.code === 11000) error = handleDuplicateFieldsDB(error);

    if(error.name === 'ValidationError') error = handleValidationErrorDB(error);

    if(error.name === 'JsonWebTokenError') error = handleJWTError(err);

    if(error.name === 'TokenExpiredError') error = handleJWTExpiredError(err);
    // console.log("err=", err, "error", error);
    sendErrorProd(error, req, res);
  }
}