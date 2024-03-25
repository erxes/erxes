import { Node } from '@tiptap/core';

export const DivNode = Node.create({
  name: 'divNode',
  group: 'block',
  content: 'block*',
  parseHTML() {
    return [{ tag: 'div' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0];
  },
  addAttributes() {
    return {
      style: {
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
      align: {
        parseHTML: (element) => element.getAttribute('align'),
      },
    };
  },
});
