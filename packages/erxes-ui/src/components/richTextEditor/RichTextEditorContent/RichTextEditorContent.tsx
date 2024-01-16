import React from 'react';
import { EditorContent } from '@tiptap/react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import { ProseMirrorWrapper } from '../styles';
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
    height = 120,
    autoGrowMinHeight = 120,
    autoGrowMaxHeight = 0,
    autoGrow = false,
  } = props;

  const editorStyle = {
    ...(autoGrow && { minHeight: autoGrowMinHeight }),
    ...(autoGrow && { maxHeight: autoGrowMaxHeight }),
    ...(!autoGrow && { height }),
  };

  function convertToPx(value: string | number) {
    // Check if the value is a number
    if (typeof value === 'number') {
      // Convert the number to a string with "px" suffix
      return `${value}px`;
    }
    return value;
  }

  return (
    <ProseMirrorWrapper data-promise-mirror-editor={true}>
      <CodeMirror
        ref={codeMirrorRef}
        style={{ outline: 'none' }}
        hidden={!isSourceEnabled}
        height={autoGrow ? undefined : convertToPx(height)}
        minHeight={convertToPx(autoGrowMinHeight)}
        maxHeight={convertToPx(autoGrowMaxHeight)}
        autoFocus={true}
        extensions={[
          html({ matchClosingTags: true, selfClosingTags: true }).extension,
        ]}
      />
      <EditorContent
        hidden={isSourceEnabled}
        editor={editor}
        style={editorStyle}
      />
    </ProseMirrorWrapper>
  );
};
