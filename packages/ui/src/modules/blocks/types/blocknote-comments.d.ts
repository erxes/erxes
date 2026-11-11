declare module '@blocknote/core/comments' {
  import type { BlockNoteEditor } from '@blocknote/core';
  export type ThreadStore = NonNullable<
    BlockNoteEditor['comments']
  >['threadStore'];
  export type ThreadData = ReturnType<ThreadStore['getThread']>;
  export type CommentData = ThreadData['comments'][number];
  export type User = Awaited<
    ReturnType<NonNullable<BlockNoteEditor['resolveUsers']>>
  >[number];
  export const ThreadStore: abstract new (
    auth: ThreadStore['auth'],
  ) => ThreadStore;
  export const DefaultThreadStoreAuth: new (
    userId: string,
    role: 'comment' | 'editor',
  ) => ThreadStore['auth'];
}
