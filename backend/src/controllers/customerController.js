import Customer from '../models/Customer.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    return sendSuccess(res, 'Customers fetched successfully', customers);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return sendError(res, 'Customer not found', 'CUSTOMER_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Customer fetched successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    return sendSuccess(res, 'Customer created successfully', customer, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!customer) {
      return sendError(res, 'Customer not found', 'CUSTOMER_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Customer updated successfully', customer);
  } catch (error) {
    next(error);
  }
};
