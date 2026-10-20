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
  if (typeof value !== 'string') throw new Error('Invalid document comments');
  if (Buffer.byteLength(value, 'utf8') > 1_000_000) {
    throw new Error('Document comments exceed the size limit');
  }
  try {
    stateSchema.parse(JSON.parse(value));
  } catch {
    throw new Error('Invalid document comments');
  }
};

type StoredComment = z.infer<typeof commentSchema>;
type StoredThread = z.infer<typeof stateSchema>['threads'][number];

const requireUniqueId = (
  seen: Set<string>,
  id: string,
  message: string,
): void => {
  if (seen.has(id)) throw new Error(message);
  seen.add(id);
};

const otherReactionUsers = (ids: string[] = [], userId: string): string[] =>
  [...new Set(ids.filter((id) => id !== userId))].sort();

const normalizeReactions = (
  comment: StoredComment,
  previous: StoredComment | undefined,
  userId: string,
  now: string,
): void => {
  const before = new Map(
    previous?.reactions.map((reaction) => [reaction.emoji, reaction]),
  );
  const after = new Map(
    comment.reactions.map((reaction) => [reaction.emoji, reaction]),
  );
  for (const emoji of new Set([...before.keys(), ...after.keys()])) {
    const oldReaction = before.get(emoji);
    const reaction = after.get(emoji);
    if (
      JSON.stringify(otherReactionUsers(oldReaction?.userIds, userId)) !==
      JSON.stringify(otherReactionUsers(reaction?.userIds, userId))
    ) {
      throw new Error('You can only change your own reactions');
    }
    if (reaction) {
      reaction.userIds = [...new Set(reaction.userIds)];
      reaction.createdAt = oldReaction?.createdAt || now;
    }
  }
  comment.reactions = [...after.values()];
};

const normalizeComment = (
  comment: StoredComment,
  previous: StoredComment | undefined,
  userId: string,
  now: string,
): void => {
  if (
    previous &&
    previous.userId !== userId &&
    (Boolean(previous.deletedAt) !== Boolean(comment.deletedAt) ||
      JSON.stringify(previous.body) !== JSON.stringify(comment.body) ||
      JSON.stringify(previous.metadata) !== JSON.stringify(comment.metadata))
  ) {
    throw new Error('You can only edit your own comments');
  }
  comment.userId = previous?.userId || userId;
  comment.createdAt = previous?.createdAt || now;
  normalizeReactions(comment, previous, userId, now);
  if (!comment.deletedAt && !comment.body?.length) {
    throw new Error('Comment body is required');
  }
};

const normalizeThreadResolution = (
  thread: StoredThread,
  previous: StoredThread | undefined,
  userId: string,
  now: string,
): void => {
  if (
    thread.deletedAt &&
    previous?.comments.some(
      (comment) => !comment.deletedAt && comment.userId !== userId,
    )
  ) {
    throw new Error('You can only delete your own comments');
  }
  thread.createdAt = previous?.createdAt || now;
  if ((previous?.resolved ?? false) !== thread.resolved) {
    thread.resolvedBy = userId;
    thread.resolvedUpdatedAt = now;
  } else {
    thread.resolvedBy = previous?.resolvedBy;
    thread.resolvedUpdatedAt = previous?.resolvedUpdatedAt;
  }
};

export const normalizeDocumentCommentState = (
  value: string,
  previousValue: string | undefined,
  userId: string,
): string => {
  validateDocumentCommentState(value);
  const state = stateSchema.parse(JSON.parse(value));
  const previous: z.infer<typeof stateSchema> = previousValue
    ? stateSchema.parse(JSON.parse(previousValue))
    : { threads: [], anchors: [] };
  const previousThreads = new Map(
    previous.threads.map((thread) => [thread.id, thread]),
  );
  const previousComments = new Map(
    previous.threads.flatMap((thread) =>
      thread.comments.map((comment) => [comment.id, comment] as const),
    ),
  );
  const seenThreads = new Set<string>();
  const seenComments = new Set<string>();
  const now = new Date().toISOString();
  for (const thread of state.threads) {
    requireUniqueId(seenThreads, thread.id, 'Duplicate comment thread ID');
    normalizeThreadResolution(
      thread,
      previousThreads.get(thread.id),
      userId,
      now,
    );
    for (const comment of thread.comments) {
      requireUniqueId(seenComments, comment.id, 'Duplicate comment ID');
      normalizeComment(comment, previousComments.get(comment.id), userId, now);
    }
  }
  for (const previousComment of previousComments.values()) {
    if (
      !seenComments.has(previousComment.id) &&
      !previousComment.deletedAt &&
      previousComment.userId !== userId
    ) {
      throw new Error('You can only delete your own comments');
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
