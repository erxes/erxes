import React from 'react';
import { EditorContent } from '@tiptap/react';
import { useRichTextEditorContext } from '../RichTextEditor.context';
export interface RichTextEditorContentProps {
  /** The height of the editing area that includes the editor content. */
  height?: number | string;
  /** Whether editing area automatically expand and shrink vertically depending on the amount and size of content entered in its editing area. */
  autoGrow?: boolean;
  /** The maximum height that the editor can assume when adjusting to content by using the Auto Grow feature. */
  autoGrowMaxHeight?: number | string;
  /** The The minimum height that the editor can assume when adjusting to content by using the Auto Grow feature. */
  autoGrowMinHeight?: number | string;
}

export const RichTextEditorContent = (props: RichTextEditorContentProps) => {
  const ctx = useRichTextEditorContext();
  const {
    height = 200,
    autoGrowMinHeight = 200,
    autoGrowMaxHeight = 0,
    autoGrow = false
  } = props;
  const editorStyle = {
    ...(autoGrow && { minHeight: autoGrowMinHeight }),
    height: autoGrow ? autoGrowMaxHeight : height
  };
  return (
    <div data-promise-mirror-editor>
      <EditorContent editor={ctx.editor} style={editorStyle} />
    </div>
  );
};
