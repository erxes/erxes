import React from 'react';
import { BubbleMenu, isTextSelection } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { EditorView } from '@tiptap/pm/view';
import { EditorState } from '@tiptap/pm/state';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import {
  IRichTextEditorControlBaseProps,
  RichTextEditorControlBase,
} from './RichTextEditorControl';
import Icon from '../../Icon';
import TableMenuControls from './TableMenuControls';

type BubbleMenuShowProps = {
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

  const shouldShow = () => {
    return ({ view, state, from, to }: BubbleMenuShowProps) => {
      // If selection is in table, show bubble menu
      if (
        state.selection.$anchor.node(1) &&
        state.selection.$anchor.node(1).type.name === 'table'
      ) {
        return true;
      }
      // Sometime check for `empty` is not enough
      const isEmptyTextBlock =
        !state.doc.textBetween(from, to).length &&
        isTextSelection(state.selection);

      if (!view.hasFocus() || state.selection.empty || isEmptyTextBlock) {
        return false;
      }
      return false;
    };
  };

  return (
    <>
      {editor && (
        <BubbleMenu
          pluginKey="tableToolbar"
          shouldShow={shouldShow()}
          editor={editor}
          tippyOptions={{ duration: 100 }}
        >
          <TableMenuControls />
        </BubbleMenu>
      )}
      <RichTextEditorControlBase
        icon={TableIcon}
        aria-label={labels.tableControlLabel}
        title={labels.tableControlLabel}
        onClick={handleTableRequest}
        disabled={!editor?.isEditable || !editor.can().insertTable()}
      />
    </>
  );
}
