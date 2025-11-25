import { z } from 'zod';

export const createCustomerSchema = z.object({
  type: z.enum(['email', 'phone']),
  value: z.string().min(1),
  customerId: z.string().optional(),
  visitorId: z.string().optional(),
});
