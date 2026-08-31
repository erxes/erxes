import { z } from 'zod';
import { MAX_POLL_OPTIONS } from '@/poll/types/pollTypes';

export const pollFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  question: z.string().trim().min(1, 'Question is required').max(300),
  options: z
    .array(
      z.object({
        _id: z.string().optional(),
        text: z.string().trim().min(1, 'Option cannot be empty').max(100),
      }),
    )
    .min(2, 'A poll needs at least 2 options')
    .max(MAX_POLL_OPTIONS)
    .superRefine((options, ctx) => {
      const seen = new Set<string>();

      options.forEach((option, index) => {
        const key = option.text.trim().toLowerCase();

        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Options must be unique',
            path: [index, 'text'],
          });
        }

        seen.add(key);
      });
    }),
  allowMultiselect: z.boolean(),
  durationHours: z.number().int().min(1).max(768).nullable(),
});

export type TPollForm = z.infer<typeof pollFormSchema>;
