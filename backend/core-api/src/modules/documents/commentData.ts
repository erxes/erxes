import { z } from 'zod';

const date = z.string().datetime();
const commentDataSchema = z.object({
  threads: z
    .array(
      z.object({
        type: z.literal('thread'),
        id: z.string().min(1),
        createdAt: date,
        updatedAt: date,
        resolved: z.boolean(),
        resolvedUpdatedAt: date.optional(),
        resolvedBy: z.string().optional(),
        metadata: z.unknown().optional(),
        comments: z
          .array(
            z.object({
              type: z.literal('comment'),
              id: z.string().min(1),
              userId: z.string().min(1),
              createdAt: date,
              updatedAt: date,
              metadata: z.unknown().optional(),
              body: z.array(z.unknown()).min(1),
              reactions: z.array(
                z.object({
                  emoji: z.string().min(1),
                  createdAt: date,
                  userIds: z.array(z.string()),
                }),
              ),
            }),
          )
          .min(1)
          .max(1000),
      }),
    )
    .max(500),
  anchors: z
    .array(
      z.object({
        threadId: z.string().min(1),
        from: z.number().int().nonnegative(),
        to: z.number().int().positive(),
      }),
    )
    .max(10000),
});

export const validateDocumentCommentData = (value?: string | null): void => {
  if (!value) return;
  if (value.length > 1000000)
    throw new Error('Document comments exceed the storage limit');
  try {
    const data: unknown = JSON.parse(value);
    commentDataSchema.parse(data);
  } catch {
    throw new Error('Invalid document comments');
  }
};
