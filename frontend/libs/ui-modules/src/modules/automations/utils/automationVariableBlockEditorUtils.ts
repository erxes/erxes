import { IBlockEditor } from 'erxes-ui';
import { TAutomationVariableDragPayload } from './automationVariableDragUtils';

// The editor's field chip; its size props only matter for barcode chips.
const attributeChip = (path: string) => ({
  type: 'attribute' as const,
  props: { name: path, value: path, width: 150, height: 50 },
});

/**
 * A list output becomes a table: a header row of its field labels and one row
 * of `list.$.field` fields, which the send step writes once per item. The
 * labels are plain text, so the headers are renamed in place.
 */
const insertItemTable = (
  editor: IBlockEditor,
  payload: TAutomationVariableDragPayload,
) => {
  const fields = payload.fields || [];
  const cursorBlock = editor.getTextCursorPosition().block;

  editor.insertBlocks(
    [
      {
        type: 'table',
        content: {
          type: 'tableContent',
          headerRows: 1,
          rows: [
            {
              cells: fields.map((field) => [
                { type: 'text' as const, text: field.label, styles: {} },
              ]),
            },
            {
              cells: fields.map((field) => [
                attributeChip(`${payload.path}.$.${field.key}`),
              ]),
            },
          ],
        },
      },
    ],
    cursorBlock,
    'after',
  );
};

export const insertAutomationVariableInBlockEditor = ({
  editor,
  payload,
}: {
  editor: IBlockEditor;
  payload: TAutomationVariableDragPayload;
}) => {
  editor.focus();

  if (payload.fields?.length) {
    insertItemTable(editor, payload);
    return;
  }

  editor.insertInlineContent([attributeChip(payload.path), ' ']);
};
