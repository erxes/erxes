import React from 'react';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import { RichTextEditorControlBase } from './RichTextEditorControl';
import { RichTextEditorControlsGroup } from '../RichTextEditorControlsGroup/RichTextEditorControlsGroup';
import {
  DeleteColumnIcon,
  DeleteRowIcon,
  FormatColorFillIcon,
  GridOffIcon,
  InsertColumnLeftIcon,
  InsertColumnRightIcon,
  InsertRowBottomIcon,
  InsertRowTopIcon,
  LayoutColumnFillIcon,
  LayoutRowFillIcon,
  MergeCellsHorizontalIcon,
  SplitCellsHorizontalIcon,
} from '../icons';

/**
 * Renders all of the controls for manipulating a table in a Tiptap editor
 * (add or delete columns or rows, merge cells, etc.).
 */

export default function TableMenuControls() {
  const { editor, labels } = useRichTextEditorContext();
  return (
    <RichTextEditorControlsGroup>
      <RichTextEditorControlBase
        icon={InsertColumnLeftIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.insertColumnBefore ?? 'Insert column before'}
        onClick={() => editor?.chain().focus().addColumnBefore().run()}
        disabled={!editor?.can().addColumnBefore()}
      />
      <RichTextEditorControlBase
        icon={InsertColumnRightIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.insertColumnAfter ?? 'Insert column after'}
        onClick={() => editor?.chain().focus().addColumnAfter().run()}
        disabled={!editor?.can().addColumnAfter()}
      />
      <RichTextEditorControlBase
        icon={DeleteColumnIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.deleteColumn ?? 'Delete column'}
        onClick={() => editor?.chain().focus().deleteColumn().run()}
        disabled={!editor?.can().deleteColumn()}
      />
      <RichTextEditorControlBase
        icon={InsertRowTopIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.insertRowAbove ?? 'Insert row above'}
        onClick={() => editor?.chain().focus().addRowBefore().run()}
        disabled={!editor?.can().addRowBefore()}
      />
      <RichTextEditorControlBase
        icon={InsertRowBottomIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.insertRowBelow ?? 'Insert row below'}
        onClick={() => editor?.chain().focus().addRowAfter().run()}
        disabled={!editor?.can().addRowAfter()}
      />
      <RichTextEditorControlBase
        icon={DeleteRowIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.deleteRow ?? 'Delete row'}
        onClick={() => editor?.chain().focus().deleteRow().run()}
        disabled={!editor?.can().deleteRow()}
      />
      <RichTextEditorControlBase
        icon={MergeCellsHorizontalIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.mergeCells ?? 'Merge cells'}
        onClick={() => editor?.chain().focus().mergeCells().run()}
        disabled={!editor?.can().mergeCells()}
      />
      <RichTextEditorControlBase
        icon={SplitCellsHorizontalIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.splitCell ?? 'Split cell'}
        onClick={() => editor?.chain().focus().splitCell().run()}
        disabled={!editor?.can().splitCell()}
      />
      <RichTextEditorControlBase
        icon={LayoutRowFillIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.toggleHeaderRow ?? 'Toggle header row'}
        onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
        disabled={!editor?.can().toggleHeaderRow()}
      />
      <RichTextEditorControlBase
        icon={LayoutColumnFillIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.toggleHeaderColumn ?? 'Toggle header column'}
        onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}
        disabled={!editor?.can().toggleHeaderColumn()}
      />
      <RichTextEditorControlBase
        icon={FormatColorFillIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.toggleHeaderCell ?? 'Toggle header cell'}
        onClick={() => editor?.chain().focus().toggleHeaderCell().run()}
        disabled={!editor?.can().toggleHeaderCell()}
        selected={editor?.isActive('tableHeader') ?? false}
      />
      <RichTextEditorControlBase
        icon={GridOffIcon}
        aria-label={labels.imageControlLabel}
        title={labels?.deleteTable ?? 'Delete table'}
        onClick={() => editor?.chain().focus().deleteTable().run()}
        disabled={!editor?.can().deleteTable()}
      />
    </RichTextEditorControlsGroup>
  );
}
