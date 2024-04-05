import React from 'react';
import { Editor } from '@tiptap/core';
import { EditorView } from '@tiptap/pm/view';
import { EditorState } from '@tiptap/pm/state';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import {
  IRichTextEditorControlBaseProps,
  RichTextEditorControlBase,
} from './RichTextEditorControl';
import Icon from '../../Icon';

export type BubbleMenuShowProps = {
  editor: Editor;
  view: EditorView;
  state: EditorState;
  oldState?: EditorState;
  from: number;
  to: number;
};
const TableIcon: IRichTextEditorControlBaseProps['icon'] = () => (
  <Icon icon="table" />
);
export function TableControl() {
  const { editor, labels } = useRichTextEditorContext();
  const handleTableRequest = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <RichTextEditorControlBase
      icon={TableIcon}
      aria-label={labels.tableControlLabel}
      title={labels.tableControlLabel}
      onClick={handleTableRequest}
      disabled={!editor?.isEditable || !editor.can().insertTable()}
    />
  );
}
