import { z } from 'zod';

export const pickMemberConfigFormSchema = z.object({
  candidateIds: z.string().trim().min(1, 'Choose at least one team member'),
  method: z.enum(['roundRobin', 'random']),
  fallbackUserId: z
    .string()
    .trim()
    .min(1, 'Choose who takes it when nobody is available'),
});

export type TPickMemberConfigForm = z.infer<typeof pickMemberConfigFormSchema>;
