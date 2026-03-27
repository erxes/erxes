import { z } from 'zod';

export const commentTriggerSchema = z.object({
  botId: z.string(),
  postType: z.enum(['specific', 'any']),
  postId: z.string(),
  checkContent: z.any().optional(),
  onlyFirstLevel: z.boolean().optional(),
  conditions: z
    .array(
      z.object({
        _id: z.string(),
        operator: z.string(),
        keywords: z.array(
          z.object({
            _id: z.string(),
            text: z.string(),
            isEditing: z.boolean().optional(),
          }),
        ),
      }),
    )
    .optional(),
});
