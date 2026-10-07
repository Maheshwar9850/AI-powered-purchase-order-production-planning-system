/**
 * Standardized API Response Helper Utilities
 */

export const sendSuccess = (res, message = 'Operation successful', data = null, statusCode = 200) => {
  const responsePayload = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    responsePayload.data = data;
  }

  return res.status(statusCode).json(responsePayload);
};

export const sendError = (res, message = 'An error occurred', errorCode = 'INTERNAL_ERROR', statusCode = 500, details = null) => {
  const responsePayload = {
    success: false,
    message,
    error: {
      code: errorCode
    }
  };

  if (details !== null && details !== undefined) {
    responsePayload.error.details = details;
  }

  return res.status(statusCode).json(responsePayload);
};
