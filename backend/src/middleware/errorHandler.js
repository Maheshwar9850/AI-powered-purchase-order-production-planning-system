import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return sendError(
      res,
      'Validation Error: One or more fields failed validation.',
      'VALIDATION_ERROR',
      400,
      details
    );
  }

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    return sendError(
      res,
      `Resource not found or invalid format for '${err.path}': '${err.value}'`,
      'INVALID_ID',
      400
    );
  }

  // Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    return sendError(
      res,
      `Duplicate entry detected for field(s): ${field}`,
      'DUPLICATE_KEY',
      409
    );
  }

  // Custom Business Error
  if (err.statusCode && err.errorCode) {
    return sendError(
      res,
      err.message,
      err.errorCode,
      err.statusCode,
      err.details || null
    );
  }

  // Default Internal Server Error
  return sendError(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'An unexpected server error occurred.',
    'INTERNAL_SERVER_ERROR',
    500
  );
};

export default errorHandler;
