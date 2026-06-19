import { z } from 'zod';

export const posOrderActionConfigFormSchema = z.object({
  posId: z.string().min(1),
  status: z.string().optional(),
  type: z.string().optional(),
  customerId: z.string().optional(),
  customerType: z.string().optional(),
  productIds: z.string().optional(),
});

export type TPosOrderActionConfigForm = z.infer<
  typeof posOrderActionConfigFormSchema
>;
