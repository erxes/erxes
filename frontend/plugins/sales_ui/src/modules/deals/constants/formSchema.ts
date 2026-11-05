import { z } from 'zod';

export const salesFormSchema = z.object({
  name: z.string().default(''),
  description: z.string().default(''),
  assignedUserIds: z.array(z.string()).optional(),
  companyId: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  labelIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  propertiesData: z.record(z.unknown()).optional(),
});

export type SalesFormType = z.infer<typeof salesFormSchema>;
