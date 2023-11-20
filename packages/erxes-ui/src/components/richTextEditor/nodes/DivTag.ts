import { Node } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/react';

export const DivTag = Node.create({
  name: 'customdiv',
  group: 'block',
  content: 'block*',
  parseHTML() {
    return [{ tag: 'div' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ];
  },
  addAttributes() {
    return {
      style: {
        parseHTML: element => element.getAttribute('style')
      }
    };
  }
});
