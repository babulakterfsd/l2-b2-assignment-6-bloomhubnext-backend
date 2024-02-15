import { z } from 'zod';

export const couponSchema = z.object({
  code: z.string().min(5).max(10),
  discount: z.string(),
  validTill: z.string(),
});
