import { Table } from '@tiptap/extension-table';
import { columnResizing, tableEditing } from '@tiptap/pm/tables';

/**
 * Extend the standard Table extension, but ensures that columns maintain their
 * previously set widths even when `editable=false`, and irrespective of the
 * initial `editable` state when the `editor` is created.
 */
export const TableImproved = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        parseHTML: (element) => element.getAttribute('align'),
        renderHTML: (attributes) => {
          return {
            align: attributes.align,
          };
        },
      },
    };
  },
  parseHTML() {
    return [{ tag: 'table' }];
  },

  // This function is taken directly from
  // https://github.com/ueberdosis/tiptap/blob/31c3a9aad9eb37f445eadcd27135611291178ca6/packages/extension-table/src/table.ts#L229-L245,
  // except overridden to always include `columnResizing`, even if `editable` is
  // false. We update our RichTextContent styles so that the table resizing
  // controls are not visible when `editable` is false, and since the editor
  // itself has contenteditable=false, the table will remain read-only. By doing
  // this, we can ensure that column widths are preserved when editable is false
  // (otherwise any dragged column widths are ignored when editable is false, as
  // reported here https://github.com/ueberdosis/tiptap/issues/2041). Moreover,
  // we do not need any hacky workarounds to ensure that the necessary table
  // extensions are reset when the editable state changes (since the resizable
  // extension will be omitted if not initially editable, or wouldn't be removed
  // if initially not editable if we relied on it being removed, as reported
  // here https://github.com/ueberdosis/tiptap/issues/2301, which was not
  // resolved despite what the OP there later said).
  addProseMirrorPlugins() {
    const isResizable = this.options.resizable;

    return [
      ...(isResizable
        ? [
            columnResizing({
              handleWidth: this.options.handleWidth,
              cellMinWidth: this.options.cellMinWidth,
              // @ts-expect-error incorrect type https://github.com/ueberdosis/tiptap/blob/b0198eb14b98db5ca691bd9bfe698ffaddbc4ded/packages/extension-table/src/table.ts#L253
              View: this.options.View,
              lastColumnResizable: this.options.lastColumnResizable,
            }),
          ]
        : []),

      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ];
  },
});
