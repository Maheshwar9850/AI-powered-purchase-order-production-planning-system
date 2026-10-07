import { sendError } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  return sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    'ROUTE_NOT_FOUND',
    404
  );
};

export default notFound;
