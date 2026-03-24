import { z } from 'zod';

export const aiAgentFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  provider: z.string(),
  prompt: z.string(),
  instructions: z.string(),
  files: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      name: z.string(),
      size: z.number(),
      type: z.string(),
      uploadedAt: z.string(),
    }),
  ),
  config: z.any(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TAiAgentForm = z.infer<typeof aiAgentFormSchema>;
