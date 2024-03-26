import TiptapHeader from '@tiptap/extension-table-header';
export const Header = TiptapHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        parseHTML: (element) => element.getAttribute('style'),
      },
    };
  },
});
