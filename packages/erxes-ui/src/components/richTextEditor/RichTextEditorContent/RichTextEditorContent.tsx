import React from 'react';
import { EditorContent } from '@tiptap/react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { useRichTextEditorContext } from '../RichTextEditor.context';
export interface IRichTextEditorContentProps {
  /** The height of the editing area that includes the editor content. */
  height?: number | string;
  /** Whether editing area automatically expand and shrink vertically depending on the amount and size of content entered in its editing area. */
  autoGrow?: boolean;
  /** The maximum height that the editor can assume when adjusting to content by using the Auto Grow feature. */
  autoGrowMaxHeight?: number | string;
  /** The The minimum height that the editor can assume when adjusting to content by using the Auto Grow feature. */
  autoGrowMinHeight?: number | string;
}

export const RichTextEditorContent = (props: IRichTextEditorContentProps) => {
  const { editor, isSourceEnabled, codeMirrorRef } = useRichTextEditorContext();
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
    <div data-promise-mirror-editor={true}>
      <CodeMirror
        ref={codeMirrorRef}
        style={{ outline: 'none' }}
        hidden={!isSourceEnabled}
        height="300px"
        minHeight="300px"
        autoFocus={true}
        extensions={[
          html({ matchClosingTags: true, selfClosingTags: true }).extension
        ]}
      />
      <EditorContent
        hidden={isSourceEnabled}
        editor={editor}
        style={editorStyle}
      />
    </div>
  );
};
