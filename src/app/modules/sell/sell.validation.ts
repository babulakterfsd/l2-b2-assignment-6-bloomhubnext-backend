import { z } from 'zod';

export const sellSchema = z.object({
  productID: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  productName: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  productPrice: z.number({
    invalid_type_error: ' must be number',
    required_error: ' is required',
  }),
  appliedCoupon: z
    .string({
      invalid_type_error: ' must be number',
      required_error: ' is required',
    })
    .optional(),
  discountPercentage: z
    .number({
      invalid_type_error: ' must be number',
      required_error: ' is required',
    })
    .optional(),
  discountGiven: z
    .number({
      invalid_type_error: ' must be number',
      required_error: ' is required',
    })
    .optional(),
  quantityToBeSold: z.number({
    invalid_type_error: ' must be number',
    required_error: ' is required',
  }),
  totalBill: z.number({
    invalid_type_error: ' must be number',
    required_error: ' is required',
  }),
  customerEmail: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  sellerEmail: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  dateOfSell: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
});
