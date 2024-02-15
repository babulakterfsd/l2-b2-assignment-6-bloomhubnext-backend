import { z } from 'zod';

export const shopkeeperSchema = z.object({
  name: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  email: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  password: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  role: z.enum(['manager', 'seller', 'customer'], {
    invalid_type_error: ' must be manager, seller or customer',
    required_error: ' is required',
  }),
});

export const signupSchema = z.object({
  name: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  email: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  password: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  role: z.enum(['manager', 'seller', 'customer'], {
    invalid_type_error: ' must be manager, seller or customer',
    required_error: ' is required',
  }),
});

export const loginSchema = z.object({
  email: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  password: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
});
