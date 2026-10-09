import type { IBlockEditor } from 'erxes-ui';

type NativeThreadStore = NonNullable<IBlockEditor['comments']>['threadStore'];
type ThreadData = ReturnType<NativeThreadStore['getThread']>;
type CommentData = ThreadData['comments'][number];
type CommentEditor = Pick<IBlockEditor, 'prosemirrorView' | 'transact'>;

const { ThreadStore, DefaultThreadStoreAuth } =
  require('@blocknote/core/comments') as {
    ThreadStore: new (auth: NativeThreadStore['auth']) => NativeThreadStore;
    DefaultThreadStoreAuth: new (
      userId: string,
      role: 'comment' | 'editor',
    ) => NativeThreadStore['auth'];
  };

type CommentAnchor = { threadId: string; from: number; to: number };
type DocumentComments = { threads: ThreadData[]; anchors: CommentAnchor[] };

/** Restore valid timestamps without allowing invalid dates into saved comment data. */
function parseCommentDate(value: unknown): Date {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime()))
    throw new TypeError('Invalid comment timestamp');
  return date;
}

/** Persist BlockNote discussions and their text anchors in a document's JSON payload. */
export class DocumentThreadStore extends ThreadStore {
  onMutation?: () => void;
  private threads = new Map<string, ThreadData>();
  private readonly listeners = new Set<
    (threads: Map<string, ThreadData>) => void
  >();

  constructor(
    private readonly userId: string,
    private readonly canEdit = true,
  ) {
    super(new DefaultThreadStoreAuth(userId, 'editor'));
    if (!canEdit) {
      for (const action of [
        'canCreateThread',
        'canAddComment',
        'canUpdateComment',
        'canDeleteComment',
        'canDeleteThread',
        'canResolveThread',
        'canUnresolveThread',
        'canAddReaction',
        'canDeleteReaction',
      ] as const) {
        this.auth[action] = () => false;
      }
    }
  }

  addThreadToDocument = undefined;

  getThread = (id: string): ThreadData => {
    const thread = this.threads.get(id);
    if (!thread) throw new Error('Comment thread not found');
    return thread;
  };

  getThreads = (): Map<string, ThreadData> => new Map(this.threads);

  subscribe = (
    listener: (threads: Map<string, ThreadData>) => void,
  ): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(changed = true): void {
    this.listeners.forEach((listener) => listener(this.getThreads()));
    if (changed) this.onMutation?.();
  }

  private assertAllowed(allowed: boolean): void {
    if (!this.userId || !this.canEdit || !allowed)
      throw new Error('Not authorized to change this comment');
  }

  private comment(body: unknown, metadata: unknown): CommentData {
    const now = new Date();
    return {
      type: 'comment',
      id: crypto.randomUUID(),
      userId: this.userId,
      createdAt: now,
      updatedAt: now,
      body,
      metadata,
      reactions: [],
    };
  }

  createThread = (
    options: Parameters<NativeThreadStore['createThread']>[0],
  ): Promise<ThreadData> =>
    Promise.resolve().then(() => {
      this.assertAllowed(this.auth.canCreateThread());
      const now = new Date();
      const thread: ThreadData = {
        type: 'thread',
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        comments: [
          this.comment(
            options.initialComment.body,
            options.initialComment.metadata,
          ),
        ],
        resolved: false,
        metadata: options.metadata,
      };
      this.threads.set(thread.id, thread);
      this.emit();
      return thread;
    });

  addComment = (
    options: Parameters<NativeThreadStore['addComment']>[0],
  ): Promise<CommentData> =>
    Promise.resolve().then(() => {
      const thread = this.getThread(options.threadId);
      this.assertAllowed(this.auth.canAddComment(thread));
      const comment = this.comment(
        options.comment.body,
        options.comment.metadata,
      );
      this.threads.set(thread.id, {
        ...thread,
        comments: [...thread.comments, comment],
        updatedAt: new Date(),
      });
      this.emit();
      return comment;
    });

  private getComment(threadId: string, commentId: string): CommentData {
    const comment = this.getThread(threadId).comments.find(
      (item) => item.id === commentId,
    );
    if (!comment) throw new Error('Comment not found');
    return comment;
  }

  private replaceComment(threadId: string, comment: CommentData): void {
    const thread = this.getThread(threadId);
    this.threads.set(threadId, {
      ...thread,
      updatedAt: new Date(),
      comments: thread.comments.map((item) =>
        item.id === comment.id ? comment : item,
      ),
    });
    this.emit();
  }

  updateComment = (
    options: Parameters<NativeThreadStore['updateComment']>[0],
  ): Promise<void> =>
    Promise.resolve().then(() => {
      const comment = this.getComment(options.threadId, options.commentId);
      this.assertAllowed(this.auth.canUpdateComment(comment));
      if (comment.deletedAt) throw new Error('Comment has been deleted');
      this.replaceComment(options.threadId, {
        ...comment,
        ...options.comment,
        updatedAt: new Date(),
      });
    });

  deleteComment = (
    options: Parameters<NativeThreadStore['deleteComment']>[0],
  ): Promise<void> =>
    Promise.resolve().then(() => {
      const thread = this.getThread(options.threadId);
      this.assertAllowed(
        this.auth.canDeleteComment(
          this.getComment(thread.id, options.commentId),
        ),
      );
      const comments = thread.comments.filter(
        (comment) => comment.id !== options.commentId,
      );
      if (comments.length) {
        this.threads.set(thread.id, {
          ...thread,
          comments,
          updatedAt: new Date(),
        });
      } else {
        this.threads.delete(thread.id);
      }
      this.emit();
    });

  deleteThread = ({ threadId }: { threadId: string }): Promise<void> =>
    Promise.resolve().then(() => {
      this.assertAllowed(this.auth.canDeleteThread(this.getThread(threadId)));
      this.threads.delete(threadId);
      this.emit();
    });

  private setResolved(threadId: string, resolved: boolean): void {
    const thread = this.getThread(threadId);
    this.assertAllowed(
      resolved
        ? this.auth.canResolveThread(thread)
        : this.auth.canUnresolveThread(thread),
    );
    this.threads.set(threadId, {
      ...thread,
      resolved,
      resolvedUpdatedAt: new Date(),
      resolvedBy: this.userId,
      updatedAt: new Date(),
    });
    this.emit();
  }

  resolveThread = ({ threadId }: { threadId: string }): Promise<void> =>
    Promise.resolve().then(() => this.setResolved(threadId, true));
  unresolveThread = ({ threadId }: { threadId: string }): Promise<void> =>
    Promise.resolve().then(() => this.setResolved(threadId, false));

  addReaction = (
    options: Parameters<NativeThreadStore['addReaction']>[0],
  ): Promise<void> =>
    Promise.resolve().then(() => {
      const comment = this.getComment(options.threadId, options.commentId);
      const existing = comment.reactions.find(
        (reaction) => reaction.emoji === options.emoji,
      );
      if (existing?.userIds.includes(this.userId)) return;
      this.assertAllowed(this.auth.canAddReaction(comment, options.emoji));
      const reactions = existing
        ? comment.reactions.map((reaction) =>
            reaction === existing
              ? { ...reaction, userIds: [...reaction.userIds, this.userId] }
              : reaction,
          )
        : [
            ...comment.reactions,
            {
              emoji: options.emoji,
              userIds: [this.userId],
              createdAt: new Date(),
            },
          ];
      this.replaceComment(options.threadId, { ...comment, reactions });
    });

  deleteReaction = (
    options: Parameters<NativeThreadStore['deleteReaction']>[0],
  ): Promise<void> =>
    Promise.resolve().then(() => {
      const comment = this.getComment(options.threadId, options.commentId);
      this.assertAllowed(this.auth.canDeleteReaction(comment, options.emoji));
      const reactions = comment.reactions
        .map((reaction) =>
          reaction.emoji === options.emoji
            ? {
                ...reaction,
                userIds: reaction.userIds.filter((id) => id !== this.userId),
              }
            : reaction,
        )
        .filter((reaction) => reaction.userIds.length);
      this.replaceComment(options.threadId, { ...comment, reactions });
    });

  serialize(editor: CommentEditor): string {
    const anchors: CommentAnchor[] = [];
    editor.prosemirrorView?.state.doc.descendants((node, from) => {
      node.marks.forEach((mark) => {
        const threadId: unknown = mark.attrs.threadId;
        if (
          mark.type.name === 'comment' &&
          typeof threadId === 'string' &&
          this.threads.has(threadId)
        ) {
          const last = anchors[anchors.length - 1];
          const to = from + node.nodeSize;
          if (last && last.threadId === threadId && last.to === from) {
            last.to = to;
          } else {
            anchors.push({ threadId, from, to });
          }
        }
      });
    });
    return JSON.stringify({ threads: [...this.threads.values()], anchors });
  }

  load(value: string | null | undefined, editor: CommentEditor): void {
    const data: DocumentComments = value
      ? JSON.parse(value)
      : { threads: [], anchors: [] };
    if (!Array.isArray(data.threads) || !Array.isArray(data.anchors)) {
      throw new TypeError('Invalid document comments');
    }
    this.threads = new Map(
      data.threads.map((thread) => [
        thread.id,
        {
          ...thread,
          createdAt: parseCommentDate(thread.createdAt),
          updatedAt: parseCommentDate(thread.updatedAt),
          resolvedUpdatedAt: thread.resolvedUpdatedAt
            ? parseCommentDate(thread.resolvedUpdatedAt)
            : undefined,
          comments: thread.comments.map((comment) => ({
            ...comment,
            createdAt: parseCommentDate(comment.createdAt),
            updatedAt: parseCommentDate(comment.updatedAt),
            reactions: comment.reactions.map((reaction) => ({
              ...reaction,
              createdAt: parseCommentDate(reaction.createdAt),
            })),
          })),
        },
      ]),
    );
    editor.transact((tr) => {
      const markType = tr.doc.type.schema.marks.comment;
      if (!markType) return;
      data.anchors.forEach(({ threadId, from, to }) => {
        const thread = this.threads.get(threadId);
        if (
          thread &&
          Number.isInteger(from) &&
          Number.isInteger(to) &&
          from >= 0 &&
          to > from &&
          to <= tr.doc.content.size
        ) {
          tr.addMark(
            from,
            to,
            markType.create({ threadId, orphan: thread.resolved }),
          );
        }
      });
    });
    this.emit(false);
  }
}
