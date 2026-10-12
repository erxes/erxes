import {
  CommentData,
  DefaultThreadStoreAuth,
  ThreadData,
  ThreadStore,
} from '@blocknote/core/comments';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { IBlockEditor } from 'erxes-ui';

const date = z
  .string()
  .datetime()
  .transform((value) => new Date(value));
const commentSchema = z.object({
  type: z.literal('comment'),
  id: z.string(),
  userId: z.string(),
  createdAt: date,
  updatedAt: date,
  deletedAt: date.optional(),
  body: z.array(z.record(z.unknown())).optional(),
  metadata: z.unknown(),
  reactions: z.array(
    z.object({
      emoji: z.string(),
      createdAt: date,
      userIds: z.array(z.string()),
    }),
  ),
});
const stateSchema = z.object({
  threads: z.array(
    z.object({
      type: z.literal('thread'),
      id: z.string(),
      createdAt: date,
      updatedAt: date,
      resolved: z.boolean(),
      resolvedUpdatedAt: date.optional(),
      resolvedBy: z.string().optional(),
      deletedAt: date.optional(),
      metadata: z.unknown(),
      comments: z.array(commentSchema),
    }),
  ),
  anchors: z.array(
    z.object({
      threadId: z.string(),
      from: z.number().int().nonnegative(),
      to: z.number().int().nonnegative(),
    }),
  ),
});

export type DocumentCommentAnchor = z.infer<
  typeof stateSchema
>['anchors'][number];

export const readDocumentComments = (
  value?: string | null,
): { threads: ThreadData[]; anchors: DocumentCommentAnchor[] } => {
  if (!value) return { threads: [], anchors: [] };
  const state = stateSchema.parse(JSON.parse(value));
  return {
    anchors: state.anchors,
    threads: state.threads.map(
      (thread): ThreadData => ({
        ...thread,
        metadata: thread.metadata,
        comments: thread.comments.map((comment): CommentData => {
          const common = { ...comment, metadata: comment.metadata };
          if (comment.deletedAt)
            return { ...common, deletedAt: comment.deletedAt, body: undefined };
          return { ...common, deletedAt: undefined, body: comment.body || [] };
        }),
      }),
    ),
  };
};

export class DocumentThreadStore extends ThreadStore {
  readonly addThreadToDocument = undefined;
  private threads = new Map<string, ThreadData>();
  private listeners = new Set<(threads: Map<string, ThreadData>) => void>();

  constructor(private readonly userId: string) {
    super(new DefaultThreadStoreAuth(userId, 'editor'));
  }

  load(threads: ThreadData[]): void {
    this.threads = new Map(threads.map((thread) => [thread.id, thread]));
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.threads));
  }

  private commit(thread: ThreadData): void {
    this.threads = new Map(this.threads).set(thread.id, {
      ...thread,
      updatedAt: new Date(),
    });
    this.emit();
  }

  private comment(threadId: string, commentId: string): CommentData {
    const comment = this.getThread(threadId).comments.find(
      (item) => item.id === commentId,
    );
    if (!comment) throw new Error('Comment not found');
    return comment;
  }

  private assert(allowed: boolean): void {
    if (!allowed) throw new Error('You cannot change this comment');
  }

  private newComment(
    comment: Parameters<ThreadStore['addComment']>[0]['comment'],
  ): CommentData {
    const now = new Date();
    return {
      type: 'comment',
      id: nanoid(),
      userId: this.userId,
      createdAt: now,
      updatedAt: now,
      body: comment.body,
      metadata: comment.metadata,
      reactions: [],
    };
  }

  async createThread(
    options: Parameters<ThreadStore['createThread']>[0],
  ): Promise<ThreadData> {
    this.assert(this.auth.canCreateThread());
    const now = new Date();
    const thread: ThreadData = {
      type: 'thread',
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
      resolved: false,
      comments: [this.newComment(options.initialComment)],
      metadata: options.metadata,
    };
    this.commit(thread);
    return thread;
  }

  async addComment({
    threadId,
    comment,
  }: Parameters<ThreadStore['addComment']>[0]): Promise<CommentData> {
    const thread = this.getThread(threadId);
    this.assert(this.auth.canAddComment(thread));
    const created = this.newComment(comment);
    this.commit({ ...thread, comments: [...thread.comments, created] });
    return created;
  }

  async updateComment({
    threadId,
    commentId,
    comment,
  }: Parameters<ThreadStore['updateComment']>[0]): Promise<void> {
    this.assert(this.auth.canUpdateComment(this.comment(threadId, commentId)));
    const thread = this.getThread(threadId);
    this.commit({
      ...thread,
      comments: thread.comments.map((item) =>
        item.id === commentId
          ? {
              ...item,
              body: comment.body,
              metadata: comment.metadata,
              updatedAt: new Date(),
              deletedAt: undefined,
            }
          : item,
      ),
    });
  }

  async deleteComment({
    threadId,
    commentId,
  }: Parameters<ThreadStore['deleteComment']>[0]): Promise<void> {
    this.assert(this.auth.canDeleteComment(this.comment(threadId, commentId)));
    const thread = this.getThread(threadId);
    const comments = thread.comments.filter((item) => item.id !== commentId);
    if (!comments.length) return this.deleteThread({ threadId });
    this.commit({ ...thread, comments });
  }

  async deleteThread({ threadId }: { threadId: string }): Promise<void> {
    this.assert(this.auth.canDeleteThread(this.getThread(threadId)));
    this.threads = new Map(this.threads);
    this.threads.delete(threadId);
    this.emit();
  }

  async resolveThread({ threadId }: { threadId: string }): Promise<void> {
    const thread = this.getThread(threadId);
    this.assert(this.auth.canResolveThread(thread));
    this.commit({
      ...thread,
      resolved: true,
      resolvedBy: this.userId,
      resolvedUpdatedAt: new Date(),
    });
  }

  async unresolveThread({ threadId }: { threadId: string }): Promise<void> {
    const thread = this.getThread(threadId);
    this.assert(this.auth.canUnresolveThread(thread));
    this.commit({
      ...thread,
      resolved: false,
      resolvedBy: this.userId,
      resolvedUpdatedAt: new Date(),
    });
  }

  async addReaction({
    threadId,
    commentId,
    emoji,
  }: Parameters<ThreadStore['addReaction']>[0]): Promise<void> {
    const comment = this.comment(threadId, commentId);
    this.assert(this.auth.canAddReaction(comment, emoji));
    const existing = comment.reactions.find(
      (reaction) => reaction.emoji === emoji,
    );
    const reactions = existing
      ? comment.reactions.map((reaction) =>
          reaction.emoji === emoji
            ? { ...reaction, userIds: [...reaction.userIds, this.userId] }
            : reaction,
        )
      : [
          ...comment.reactions,
          { emoji, createdAt: new Date(), userIds: [this.userId] },
        ];
    this.setReactions(threadId, commentId, reactions);
  }

  async deleteReaction({
    threadId,
    commentId,
    emoji,
  }: Parameters<ThreadStore['deleteReaction']>[0]): Promise<void> {
    const comment = this.comment(threadId, commentId);
    this.assert(this.auth.canDeleteReaction(comment, emoji));
    this.setReactions(
      threadId,
      commentId,
      comment.reactions
        .map((reaction) =>
          reaction.emoji === emoji
            ? {
                ...reaction,
                userIds: reaction.userIds.filter((id) => id !== this.userId),
              }
            : reaction,
        )
        .filter((reaction) => reaction.userIds.length > 0),
    );
  }

  private setReactions(
    threadId: string,
    commentId: string,
    reactions: CommentData['reactions'],
  ): void {
    const thread = this.getThread(threadId);
    this.commit({
      ...thread,
      comments: thread.comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, reactions, updatedAt: new Date() }
          : comment,
      ),
    });
  }

  getThread(threadId: string): ThreadData {
    const thread = this.threads.get(threadId);
    if (!thread) throw new Error('Comment thread not found');
    return thread;
  }

  getThreads(): Map<string, ThreadData> {
    return this.threads;
  }

  subscribe(callback: (threads: Map<string, ThreadData>) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const serializeDocumentComments = (
  editor: Pick<IBlockEditor, 'prosemirrorState' | 'transact' | 'comments'>,
  store: DocumentThreadStore,
): string => {
  const anchors: DocumentCommentAnchor[] = [];
  editor.prosemirrorState.doc.descendants((node, from) => {
    node.marks.forEach((mark) => {
      const threadId: unknown = mark.attrs.threadId;
      if (
        mark.type.name === 'comment' &&
        typeof threadId === 'string' &&
        store.getThreads().has(threadId)
      ) {
        anchors.push({ threadId, from, to: from + node.nodeSize });
      }
    });
  });
  return JSON.stringify({
    threads: Array.from(store.getThreads().values()),
    anchors,
  });
};

export const restoreDocumentCommentAnchors = (
  editor: Pick<IBlockEditor, 'prosemirrorState' | 'transact' | 'comments'>,
  anchors: DocumentCommentAnchor[],
): void => {
  editor.transact((transaction) => {
    const mark = transaction.doc.type.schema.marks.comment;
    if (!mark) return;
    for (const anchor of anchors) {
      if (
        anchor.from < anchor.to &&
        anchor.to <= transaction.doc.content.size
      ) {
        transaction.addMark(
          anchor.from,
          anchor.to,
          mark.create({
            threadId: anchor.threadId,
            orphan: Boolean(
              editor.comments?.threadStore.getThreads().get(anchor.threadId)
                ?.resolved,
            ),
          }),
        );
      }
    }
  });
};
