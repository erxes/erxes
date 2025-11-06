import { z } from 'zod';

export const TmsFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().min(1, 'Color is required'),
  logo: z.string().optional().default(''),
  favIcon: z.string().optional().default(''),
  generalManager: z.array(z.string()).optional().default([]),
  managers: z.array(z.string()).optional().default([]),
  payment: z.string().optional().default(''),
  token: z.string().optional().default(''),
  otherPayments: z
    .array(
      z.object({
        type: z.string().min(1, 'Type is required'),
        title: z.string().min(1, 'Title is required'),
        icon: z.string().min(1, 'Icon is required'),
        config: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
});

export type TmsFormType = z.infer<typeof TmsFormSchema>;
