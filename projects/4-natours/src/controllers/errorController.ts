import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

interface AppErrorLike extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number;
  errmsg?: string;
  path?: string;
  value?: string;
  errors?: Record<string, { message: string }>;
}

const handleCastErrorDB = (err: AppErrorLike) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: AppErrorLike) => {
  const source = err.errmsg ?? err.message ?? '';
  const value = source.match(/(["'])(\\?.)*?\1/)?.[0] ?? 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: AppErrorLike) => {
  const errors = Object.values(err.errors ?? {}).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: AppErrorLike, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode ?? 500).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  console.error('ERROR', err);
  return res.status(err.statusCode ?? 500).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err: AppErrorLike, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode ?? 500).json({
        status: err.status,
        message: err.message
      });
    }
    console.error('ERROR', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode ?? 500).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  console.error('ERROR', err);
  return res.status(500).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

export default (err: AppErrorLike, req: Request, res: Response, _next: NextFunction) => {
  err.statusCode = err.statusCode ?? 500;
  err.status = err.status ?? 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error: AppErrorLike = { ...err, message: err.message, name: err.name };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
