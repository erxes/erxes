import React from 'react';
import { EditorContent } from '@tiptap/react';
import { useRichTextEditorContext } from '../RichTextEditor.context';

export const RichTextEditorContent = () => {
  const ctx = useRichTextEditorContext();
  return (
    <div data-promise-mirror-editor>
      <EditorContent editor={ctx.editor} />
    </div>
  );
};
