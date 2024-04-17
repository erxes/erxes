import TiptapCell from '@tiptap/extension-table-cell';

export const Cell = TiptapCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        parseHTML: (element) => element.getAttribute('style'),
      },
      align: {
        parseHTML: (element) => element.getAttribute('align'),
      },
    };
  },
});
