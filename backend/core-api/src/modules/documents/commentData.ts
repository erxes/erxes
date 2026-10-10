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
              reactions: z
                .array(
                  z.object({
                    emoji: z.string().min(1),
                    createdAt: date,
                    userIds: z
                      .array(z.string())
                      .refine((ids) => new Set(ids).size === ids.length),
                  }),
                )
                .refine(
                  (reactions) =>
                    new Set(reactions.map(({ emoji }) => emoji)).size ===
                    reactions.length,
                ),
            }),
          )
          .min(1)
          .max(1000)
          .refine(
            (comments) =>
              new Set(comments.map(({ id }) => id)).size === comments.length,
          ),
      }),
    )
    .max(500)
    .refine(
      (threads) => new Set(threads.map(({ id }) => id)).size === threads.length,
    ),
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

type CommentData = z.infer<
  typeof commentDataSchema
>['threads'][number]['comments'][number];

function parseCommentData(
  value: string,
  message: string,
): z.infer<typeof commentDataSchema> {
  try {
    return commentDataSchema.parse(JSON.parse(value));
  } catch {
    throw new Error(message);
  }
}

function validateCommentAuthor(
  comment: CommentData,
  original: CommentData | undefined,
  userId: string,
): void {
  if (!original) {
    if (comment.userId !== userId)
      throw new Error('New comments must belong to the acting user');
    return;
  }
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

function validateCommentReactions(
  comment: CommentData,
  original: CommentData | undefined,
  userId: string,
): void {
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

/** Validate stored discussions and prevent forging authors or changing another author's text. */
export const validateDocumentCommentData = (
  value: string | null | undefined,
  userId: string,
  previousValue?: string | null,
): void => {
  if (!value) return;
  if (value.length > 1000000)
    throw new Error('Document comments exceed the storage limit');
  const data = parseCommentData(value, 'Invalid document comments');
  const previous: Pick<
    z.infer<typeof commentDataSchema>,
    'threads'
  > = previousValue
    ? parseCommentData(previousValue, 'Stored document comments are invalid')
    : { threads: [] };
  const previousThreads = new Map(
    previous.threads.map((thread) => [thread.id, thread]),
  );
  for (const thread of data.threads) {
    const previousComments = new Map(
      previousThreads
        .get(thread.id)
        ?.comments.map((comment) => [comment.id, comment]),
    );
    for (const comment of thread.comments) {
      const original = previousComments.get(comment.id);
      validateCommentAuthor(comment, original, userId);
      validateCommentReactions(comment, original, userId);
    }
  }
};
