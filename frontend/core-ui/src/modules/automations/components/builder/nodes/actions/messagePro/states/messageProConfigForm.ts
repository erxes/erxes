import { z } from 'zod';

export const messageProConfigFormSchema = z.object({
  documentId: z.string().min(1, 'Please select a document'),
});

export type TMessageProConfigForm = z.infer<typeof messageProConfigFormSchema>;
