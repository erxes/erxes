import { useBlockNoteEditor, useEditorState } from '@blocknote/react';

export const useCodeActive = () => {
  const editor = useBlockNoteEditor();

  return useEditorState({ editor, selector: () => Boolean(editor.getActiveStyles().code) });
};
