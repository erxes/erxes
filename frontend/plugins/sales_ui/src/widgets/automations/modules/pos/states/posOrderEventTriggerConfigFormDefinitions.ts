import { z } from 'zod';

export const posOrderEventTriggerConfigFormSchema = z.object({
  eventType: z.string().min(1),
  posId: z.string().optional(),
  posToken: z.string().optional(),
  orderType: z.string().optional(),
  paymentType: z.string().optional(),
  fromStatus: z.string().optional(),
  toStatus: z.string().optional(),
});

export type TPosOrderEventTriggerConfigForm = z.infer<
  typeof posOrderEventTriggerConfigFormSchema
>;
