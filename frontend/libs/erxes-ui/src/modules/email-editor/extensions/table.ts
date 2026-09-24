import {
  callOrReturn,
  getExtensionField,
  mergeAttributes,
  Node,
} from '@tiptap/core';
import type { EditorState } from '@tiptap/pm/state';

type Dispatch = ((args?: unknown) => unknown) | undefined;
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
  goToNextCell,
  isInTable,
  mergeCells,
  selectedRect,
  splitCell,
  tableEditing,
  toggleHeaderRow,
} from '@tiptap/pm/tables';
import { gapCursor } from '@tiptap/pm/gapcursor';
import { TextSelection } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    emailTable: {
      insertTable: (options?: { rows?: number; cols?: number }) => ReturnType;
      addRowBefore: () => ReturnType;
      addRowAfter: () => ReturnType;
      deleteRow: () => ReturnType;
      addColumnBefore: () => ReturnType;
      addColumnAfter: () => ReturnType;
      deleteColumn: () => ReturnType;
      toggleHeaderRow: () => ReturnType;
      mergeCells: () => ReturnType;
      splitCell: () => ReturnType;
      deleteTable: () => ReturnType;
      setTableBackground: (options: {
        color: string | null;
        scope: TEmailTableBackgroundScope;
      }) => ReturnType;
    };
  }
}

/** How far a background colour reaches from the cell the caret is in. */
export type TEmailTableBackgroundScope = 'cell' | 'row' | 'column' | 'table';

const cellAttributes = (defaultBackground: string | null) => ({
  colspan: { default: 1 },
  rowspan: { default: 1 },
  colwidth: {
    default: null,
    parseHTML: (element: HTMLElement) => {
      const width = element.getAttribute('colwidth');

      return width ? width.split(',').map((part) => parseInt(part, 10)) : null;
    },
  },
  // Carried on the cell rather than the row or the column: a table in an
  // email is only ever a grid of cells by the time it is sent.
  backgroundColor: {
    default: defaultBackground,
    parseHTML: (element: HTMLElement) =>
      element.style.backgroundColor || defaultBackground,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor
        ? { style: `background-color: ${attributes.backgroundColor}` }
        : {},
  },
});

/**
 * Email tables, kept deliberately plain: no column resizing, because what is
 * sent has to survive mail clients that ignore half of it anyway.
 */
export const EmailTable = Node.create({
  name: 'table',
  // Above the editor's own Tab handling, so Tab walks the table when the
  // caret is in one.
  priority: 200,
  group: 'block',
  content: 'tableRow+',
  tableRole: 'table',
  isolating: true,

  parseHTML: () => [{ tag: 'table' }],

  renderHTML: ({ HTMLAttributes }) => [
    'table',
    mergeAttributes(HTMLAttributes, {
      style: 'border-collapse: collapse; width: 100%;',
    }),
    ['tbody', 0],
  ],

  // `tableRole` is a schema field prosemirror-tables reads off the node type.
  // Declaring it on the extension is not enough — without this it never
  // reaches the schema, and every table command silently does nothing.
  extendNodeSchema(extension) {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage,
    };

    return {
      tableRole: callOrReturn(
        getExtensionField(extension, 'tableRole', context),
      ),
    };
  },

  // The gap cursor is what lets the caret sit before or after a table, so a
  // table at the end of an email is not a dead end.
  addProseMirrorPlugins: () => [tableEditing(), gapCursor()],

  addCommands() {
    // Prosemirror commands build their own transaction, so they must be run
    // on their own — never inside a chain, whose transaction they would not
    // be part of ("Applying a mismatched transaction").
    const run =
      (command: typeof addRowAfter) =>
      () =>
      ({ state, dispatch }: { state: EditorState; dispatch?: Dispatch }) =>
        command(state, dispatch);

    return {
      insertTable:
        ({ rows = 3, cols = 2 } = {}) =>
        ({ chain, state }) => {
          const cell = (type: 'tableCell' | 'tableHeader') => ({
            type,
            content: [{ type: 'paragraph' }],
          });

          const table = {
            type: 'table',
            content: Array.from({ length: rows }, (_, rowIndex) => ({
              type: 'tableRow',
              content: Array.from({ length: cols }, () =>
                cell(rowIndex === 0 ? 'tableHeader' : 'tableCell'),
              ),
            })),
          };

          // Where the first cell will land. Read before the insert, because
          // positions afterwards belong to a document that has moved.
          const cellPosition = state.selection.from + 3;

          return chain()
            // A paragraph after it, so there is always somewhere to type once
            // the table is done.
            .insertContent([table, { type: 'paragraph' }])
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                dispatch(
                  tr.setSelection(
                    TextSelection.near(
                      tr.doc.resolve(
                        Math.min(cellPosition, tr.doc.content.size),
                      ),
                    ),
                  ),
                );
              }

              return true;
            })
            .run();
        },
      addRowBefore: run(addRowBefore),
      addRowAfter: run(addRowAfter),
      deleteRow: run(deleteRow),
      addColumnBefore: run(addColumnBefore),
      addColumnAfter: run(addColumnAfter),
      deleteColumn: run(deleteColumn),
      toggleHeaderRow: run(toggleHeaderRow),
      mergeCells: run(mergeCells),
      splitCell: run(splitCell),
      deleteTable: run(deleteTable),
      setTableBackground:
        ({ color, scope }) =>
        ({ state, dispatch }) => {
          if (!isInTable(state)) {
            return false;
          }

          const rect = selectedRect(state);
          const { map, tableStart } = rect;

          const area = {
            cell: {
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
            },
            row: { left: 0, right: map.width, top: rect.top, bottom: rect.bottom },
            column: {
              left: rect.left,
              right: rect.right,
              top: 0,
              bottom: map.height,
            },
            table: { left: 0, right: map.width, top: 0, bottom: map.height },
          }[scope];

          if (!dispatch) {
            return true;
          }

          const { tr } = state;

          for (const pos of map.cellsInRect(area)) {
            tr.setNodeAttribute(tableStart + pos, 'backgroundColor', color);
          }

          dispatch(tr);

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Tab walks the table and grows it at the end, the way every other
      // editor does — otherwise the last cell is a dead end.
      Tab: () => {
        const goNext = () =>
          this.editor.commands.command(({ state, dispatch }) =>
            goToNextCell(1)(state, dispatch),
          );

        if (goNext()) {
          return true;
        }

        if (!this.editor.isActive('table')) {
          return false;
        }

        return this.editor.commands.addRowAfter() && goNext();
      },
      'Shift-Tab': () =>
        this.editor.commands.command(({ state, dispatch }) =>
          goToNextCell(-1)(state, dispatch),
        ),
      // Down at the end of the last row leaves the table. Without it the
      // caret is stuck inside, since a cell has nowhere below it.
      ArrowDown: () => {
        const { $from } = this.editor.state.selection;

        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name !== 'table') {
            continue;
          }

          const isLastRow =
            $from.index(depth) === $from.node(depth).childCount - 1;
          const isLastBlockOfCell =
            $from.index(depth + 2) === $from.node(depth + 2).childCount - 1;
          const isEndOfBlock = $from.parentOffset === $from.parent.content.size;

          if (!isLastRow || !isLastBlockOfCell || !isEndOfBlock) {
            return false;
          }

          const after = $from.after(depth);

          return this.editor.commands.command(({ tr, dispatch }) => {
            if (dispatch) {
              dispatch(
                tr
                  .setSelection(
                    TextSelection.near(
                      tr.doc.resolve(Math.min(after, tr.doc.content.size)),
                      1,
                    ),
                  )
                  .scrollIntoView(),
              );
            }

            return true;
          });
        }

        return false;
      },
    };
  },
});

/** What a header cell starts out as, until someone picks something else. */
export const HEADER_BACKGROUND = '#f9fafb';

export const EmailTableRow = Node.create({
  name: 'tableRow',
  content: '(tableCell | tableHeader)*',
  tableRole: 'row',
  parseHTML: () => [{ tag: 'tr' }],
  renderHTML: ({ HTMLAttributes }) => ['tr', mergeAttributes(HTMLAttributes), 0],
});

export const EmailTableCell = Node.create({
  name: 'tableCell',
  content: 'block+',
  tableRole: 'cell',
  isolating: true,
  addAttributes: () => cellAttributes(null),
  parseHTML: () => [{ tag: 'td' }],
  renderHTML: ({ HTMLAttributes }) => [
    'td',
    mergeAttributes(HTMLAttributes, {
      style: 'border: 1px solid #e5e7eb; padding: 8px 12px;',
    }),
    0,
  ],
});

export const EmailTableHeader = Node.create({
  name: 'tableHeader',
  content: 'block+',
  tableRole: 'header_cell',
  isolating: true,
  addAttributes: () => cellAttributes(HEADER_BACKGROUND),
  parseHTML: () => [{ tag: 'th' }],
  renderHTML: ({ HTMLAttributes }) => [
    'th',
    // The background comes from the cell's own attribute, so a header a
    // colour was picked for is not painted over by a fixed style.
    mergeAttributes(HTMLAttributes, {
      style:
        'border: 1px solid #e5e7eb; padding: 8px 12px; font-weight: 600; text-align: left;',
    }),
    0,
  ],
});

export const EMAIL_TABLE_EXTENSIONS = [
  EmailTable,
  EmailTableRow,
  EmailTableCell,
  EmailTableHeader,
];
