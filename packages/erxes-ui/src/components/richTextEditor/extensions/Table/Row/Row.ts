import TiptapRow from '@tiptap/extension-table-row';

export const Row = TiptapRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        parseHTML: (element) => element.getAttribute('style'),
      },
    };
  },
});
