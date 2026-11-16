import { z } from 'zod';

// Critical first: the order a support lead reads the promises in.
export const SLA_FORM_PRIORITIES = [4, 3, 2, 1, 0];

const hours = z
  .string()
  .optional()
  .refine((value) => !value || Number(value) > 0, {
    message: 'Enter a positive number of hours',
  });

export const pipelineSlaFormSchema = z.object({
  enabled: z.boolean(),
  warnBeforeHours: hours,
  rules: z.array(
    z.object({
      priority: z.number(),
      firstResponseHours: hours,
      resolutionHours: hours,
    }),
  ),
});

export type TPipelineSlaForm = z.infer<typeof pipelineSlaFormSchema>;
