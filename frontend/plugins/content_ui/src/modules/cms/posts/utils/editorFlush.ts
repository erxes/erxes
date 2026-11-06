type EditorFlush = () => Promise<void>;

const editorFlushes = new Set<EditorFlush>();

export const registerCmsEditorFlush = (flush: EditorFlush) => {
  editorFlushes.add(flush);

  return () => {
    editorFlushes.delete(flush);
  };
};

export const flushCmsEditors = async () => {
  await Promise.all([...editorFlushes].map((flush) => flush()));
};
