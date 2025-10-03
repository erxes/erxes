import { z } from 'zod';

export const TmsFormSchema = z.object({
  name: z.string().min(1, 'Tour name is required'),
  color: z.string().min(1, 'Color is required'),
  logo: z.string().optional(),
  favIcon: z.string().optional(),
  generalManeger: z.string().optional(),
  manegers: z.array(z.string()).optional(),
  payment: z.string().optional(),
  token: z.string().optional(),
  otherPayments: z
    .array(
      z.object({
        type: z.string().optional(),
        title: z.string().optional(),
        icon: z.string().optional(),
        config: z.string().optional(),
      }),
    )
    .optional(),
});

export type TmsFormType = z.infer<typeof TmsFormSchema>;
