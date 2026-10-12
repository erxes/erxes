import {
  useBlockNoteEditor,
  useEditorContentOrSelectionChange,
} from '@blocknote/react';
import { useState } from 'react';

export const useCodeActive = (): boolean => {
  const editor = useBlockNoteEditor();
  const [codeActive, setCodeActive] = useState(
    Boolean(editor.getActiveStyles().code),
  );

  useEditorContentOrSelectionChange(() => {
    setCodeActive(Boolean(editor.getActiveStyles().code));
  }, editor);

  return codeActive;
};
