import Table from '@tiptap/extension-table';

export const TableAlign = Table.extend({
  name: 'tableAlign',
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        parseHTML: element => element.getAttribute('align'),
        renderHTML: attributes => {
          return {
            align: attributes.align
          };
        }
      }
    };
  },
  parseHTML() {
    return [{ tag: 'table' }];
  }
});
