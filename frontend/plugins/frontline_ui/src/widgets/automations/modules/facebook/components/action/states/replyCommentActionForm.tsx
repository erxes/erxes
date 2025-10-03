import { z } from 'zod';

export const commentActionFormSchema = z.object({
  text: z.string(),
  attachments: z.any().optional(),
});

export type TCommentActionForm = z.infer<typeof commentActionFormSchema>;
