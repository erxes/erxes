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

const otherReactionUsers = (userId: string, ids: string[] = []): string[] =>
  [...new Set(ids.filter((id) => id !== userId))].sort((left, right) =>
    left.localeCompare(right),
  );

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
      JSON.stringify(otherReactionUsers(userId, oldReaction?.userIds)) !==
      JSON.stringify(otherReactionUsers(userId, reaction?.userIds))
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
): StoredComment => {
  if (
    previous &&
    (previous.deletedAt ||
      Date.parse(comment.updatedAt) < Date.parse(previous.updatedAt))
  ) {
    return previous;
  }
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
  return comment;
};

const normalizeThreadResolution = (
  thread: StoredThread,
  previous: StoredThread | undefined,
  userId: string,
  now: string,
): void => {
  thread.createdAt = previous?.createdAt || now;
  const staleResolution =
    previous?.resolvedUpdatedAt &&
    (!thread.resolvedUpdatedAt ||
      Date.parse(thread.resolvedUpdatedAt) !==
        Date.parse(previous.resolvedUpdatedAt));
  if (staleResolution) thread.resolved = previous.resolved;
  if (!staleResolution && (previous?.resolved ?? false) !== thread.resolved) {
    thread.resolvedBy = userId;
    thread.resolvedUpdatedAt = now;
  } else {
    thread.resolvedBy = previous?.resolvedBy;
    thread.resolvedUpdatedAt = previous?.resolvedUpdatedAt;
  }
};

const restoreMissingComments = (
  thread: StoredThread,
  previous: StoredThread,
  seen: Set<string>,
): void => {
  const current = new Set(thread.comments.map((comment) => comment.id));
  for (const comment of previous.comments) {
    if (current.has(comment.id)) continue;
    requireUniqueId(seen, comment.id, 'Duplicate comment ID');
    thread.comments.push(comment);
  }
};

const restoreMissingThreads = (
  threads: StoredThread[],
  previous: StoredThread[],
  seenThreads: Set<string>,
  seenComments: Set<string>,
): void => {
  const current = new Map(threads.map((thread) => [thread.id, thread]));
  for (const old of previous) {
    const thread = current.get(old.id);
    if (thread) restoreMissingComments(thread, old, seenComments);
    else {
      for (const comment of old.comments)
        requireUniqueId(seenComments, comment.id, 'Duplicate comment ID');
      seenThreads.add(old.id);
      threads.push(old);
    }
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
    thread.comments = thread.comments.map((comment) => {
      requireUniqueId(seenComments, comment.id, 'Duplicate comment ID');
      return normalizeComment(
        comment,
        previousComments.get(comment.id),
        userId,
        now,
      );
    });
  }
  restoreMissingThreads(
    state.threads,
    previous.threads,
    seenThreads,
    seenComments,
  );
  for (const thread of state.threads) {
    thread.deletedAt = thread.comments.every((comment) => comment.deletedAt)
      ? previousThreads.get(thread.id)?.deletedAt || thread.deletedAt || now
      : undefined;
  }
  if (
    state.anchors.some(
      (anchor) => anchor.from >= anchor.to || !seenThreads.has(anchor.threadId),
    )
  ) {
    throw new Error('Invalid document comment anchor');
  }
  const normalized = JSON.stringify(state);
  validateDocumentCommentState(normalized);
  return normalized;
};
