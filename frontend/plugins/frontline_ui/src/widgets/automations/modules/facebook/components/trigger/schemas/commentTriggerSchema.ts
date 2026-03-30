import { z } from 'zod';

const keywordConditionSchema = z.object({
  _id: z.string().min(1),
  operator: z.string(),
  keywords: z.array(
    z.object({
      _id: z.string().min(1),
      text: z.string(),
      isEditing: z.boolean().optional(),
    }),
  ),
});

const commentTriggerBaseSchema = {
  botId: z.string().min(1),
  checkContent: z.any().optional(),
  onlyFirstLevel: z.boolean().optional(),
  conditions: z.array(keywordConditionSchema).optional(),
} satisfies Record<string, z.ZodTypeAny>;

export const commentTriggerSchema = z.discriminatedUnion('postType', [
  z.object({
    postType: z.literal('specific'),
    postId: z.string().min(1),
    ...commentTriggerBaseSchema,
  }),
  z.object({
    postType: z.literal('any'),
    postId: z.undefined().optional(),
    ...commentTriggerBaseSchema,
  }),
]);
