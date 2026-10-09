import { z } from 'zod';
import { isDeepStrictEqual } from 'node:util';

const date = z.string().datetime({ offset: true });
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

/** Validate stored discussions and prevent forging authors or changing another author's text. */
export const validateDocumentCommentData = (
  value: string | null | undefined,
  userId: string,
  previousValue?: string | null,
): void => {
  if (!value) return;
  if (value.length > 1000000)
    throw new Error('Document comments exceed the storage limit');
  let data: z.infer<typeof commentDataSchema>;
  try {
    data = commentDataSchema.parse(JSON.parse(value));
  } catch {
    throw new Error('Invalid document comments');
  }
  const previous: Pick<
    z.infer<typeof commentDataSchema>,
    'threads'
  > = previousValue
    ? commentDataSchema.parse(JSON.parse(previousValue))
    : { threads: [] };
  const previousComments = new Map(
    previous.threads.flatMap((thread) =>
      thread.comments.map(
        (comment) => [`${thread.id}:${comment.id}`, comment] as const,
      ),
    ),
  );
  for (const thread of data.threads) {
    for (const comment of thread.comments) {
      const original = previousComments.get(`${thread.id}:${comment.id}`);
      if (!original) {
        if (comment.userId !== userId)
          throw new Error('New comments must belong to the acting user');
      } else {
        if (
          comment.userId !== original.userId ||
          new Date(comment.createdAt).getTime() !==
            new Date(original.createdAt).getTime()
        ) {
          throw new Error('Comment authorship cannot be changed');
        }
        if (
          original.userId !== userId &&
          (!isDeepStrictEqual(comment.body, original.body) ||
            !isDeepStrictEqual(comment.metadata, original.metadata) ||
            new Date(comment.updatedAt).getTime() !==
              new Date(original.updatedAt).getTime())
        ) {
          throw new Error('Only the author can edit a comment');
        }
      }
      const emojis = new Set(
        [...comment.reactions, ...(original?.reactions || [])].map(
          (reaction) => reaction.emoji,
        ),
      );
      for (const emoji of emojis) {
        const previousUsers = new Set(
          original?.reactions
            .find((reaction) => reaction.emoji === emoji)
            ?.userIds.filter((id) => id !== userId),
        );
        const nextUsers = new Set(
          comment.reactions
            .find((reaction) => reaction.emoji === emoji)
            ?.userIds.filter((id) => id !== userId),
        );
        if (!isDeepStrictEqual(previousUsers, nextUsers))
          throw new Error('Only your own reactions can be changed');
      }
    }
  }
};
