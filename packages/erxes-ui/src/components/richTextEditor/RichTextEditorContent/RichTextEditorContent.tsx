import React from 'react';
import { EditorContent } from '@tiptap/react';
import { useRichTextEditorContext } from '../RichTextEditor.context';

export type RichTextEditorContentFactory = {
  props: any;
  ref: HTMLDivElement;
};

export const RichTextEditorContent = props => {
  const ctx = useRichTextEditorContext();
  return (
    <div data-promise-mirror-editor {...props}>
      <EditorContent editor={ctx.editor} />
    </div>
  );
};
