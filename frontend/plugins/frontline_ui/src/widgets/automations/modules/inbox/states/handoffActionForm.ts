import { z } from 'zod';

export const handoffActionFormSchema = z.object({
  assignTo: z.string().optional(),
  pauseMinutes: z
    .string()
    .optional()
    .refine((value) => !value || Number(value) > 0, {
      message: 'Enter a positive number of minutes',
    }),
});

export type THandoffActionForm = z.infer<typeof handoffActionFormSchema>;
