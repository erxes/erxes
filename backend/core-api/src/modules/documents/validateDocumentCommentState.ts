import { z } from 'zod';

const date = z.string().datetime();
const commentSchema = z.object({
  type: z.literal('comment'),
  id: z.string().min(1),
  userId: z.string().min(1),
  createdAt: date,
  updatedAt: date,
  deletedAt: date.optional(),
  body: z.array(z.record(z.unknown())).optional(),
  metadata: z.unknown().optional(),
  reactions: z.array(
    z.object({
      emoji: z.string().min(1),
      createdAt: date,
      userIds: z.array(z.string().min(1)),
    }),
  ),
});

const stateSchema = z.object({
  threads: z.array(
    z.object({
      type: z.literal('thread'),
      id: z.string().min(1),
      createdAt: date,
      updatedAt: date,
      comments: z.array(commentSchema),
      resolved: z.boolean(),
      resolvedUpdatedAt: date.optional(),
      resolvedBy: z.string().optional(),
      deletedAt: date.optional(),
      metadata: z.unknown().optional(),
    }),
  ),
  anchors: z.array(
    z.object({
      threadId: z.string().min(1),
      from: z.number().int().nonnegative(),
      to: z.number().int().nonnegative(),
    }),
  ),
});

export const validateDocumentCommentState = (value: string): void => {
  if (Buffer.byteLength(value, 'utf8') > 1_000_000) {
    throw new Error('Document comments exceed the size limit');
  }
  try {
    stateSchema.parse(JSON.parse(value));
  } catch {
    throw new Error('Invalid document comments');
  }
};

export const normalizeDocumentCommentState = (
  value: string,
  previousValue: string | undefined,
  userId: string,
): string => {
  validateDocumentCommentState(value);
  const state = stateSchema.parse(JSON.parse(value));
  const previous = previousValue
    ? stateSchema.parse(JSON.parse(previousValue))
    : { threads: [] };
  const previousComments = new Map<string, z.infer<typeof commentSchema>>();
  for (const thread of previous.threads) {
    for (const comment of thread.comments)
      previousComments.set(comment.id, comment);
  }
  const seenThreads = new Set<string>();
  const seenComments = new Set<string>();
  for (const thread of state.threads) {
    if (seenThreads.has(thread.id))
      throw new Error('Duplicate comment thread ID');
    seenThreads.add(thread.id);
    for (const comment of thread.comments) {
      if (seenComments.has(comment.id)) throw new Error('Duplicate comment ID');
      seenComments.add(comment.id);
      const old = previousComments.get(comment.id);
      if (
        old &&
        old.userId !== userId &&
        JSON.stringify(old.body) !== JSON.stringify(comment.body)
      ) {
        throw new Error('You can only edit your own comments');
      }
      comment.userId = old?.userId || userId;
      comment.createdAt = old?.createdAt || new Date().toISOString();
      if (!comment.deletedAt && !comment.body?.length)
        throw new Error('Comment body is required');
    }
  }
  if (
    state.anchors.some(
      (anchor) => anchor.from >= anchor.to || !seenThreads.has(anchor.threadId),
    )
  ) {
    throw new Error('Invalid document comment anchor');
  }
  return JSON.stringify(state);
};
