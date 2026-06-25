import { z } from 'zod';

export const messageProConfigFormSchema = z.object({
  contentType: z.string().optional(),
  documentId: z.string().min(1, 'Please select a document'),
});

export type TMessageProConfigForm = z.infer<typeof messageProConfigFormSchema>;
