import {
  ThreadsSidebar,
  useBlockNoteEditor,
  useThreads,
} from '@blocknote/react';

export const DocumentCommentsSidebar = () => {
  const editor = useBlockNoteEditor();
  const threads = useThreads(editor);

  if (!threads.size) {
    return (
      <p className="px-3 py-2 text-sm text-muted-foreground">
        No comments yet.
      </p>
    );
  }

  return <ThreadsSidebar filter="all" />;
};
