import mongoose from 'mongoose';
import { sendError } from '../utils/apiResponse.js';

export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const idValue = req.params[paramName];
    if (!idValue || !mongoose.Types.ObjectId.isValid(idValue)) {
      return sendError(
        res,
        `Invalid parameter format for ${paramName}: '${idValue}'. Expected 24-character hexadecimal ObjectId.`,
        'INVALID_OBJECT_ID',
        400
      );
    }
    next();
  };
};

export default validateObjectId;
