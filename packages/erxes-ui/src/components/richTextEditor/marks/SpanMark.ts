import { Mark, mergeAttributes } from '@tiptap/core';

export const SpanMark = Mark.create({
  name: 'spanMark',
  excludes: '',
  parseHTML() {
    return [{ tag: 'span' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
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
    };
  },
});
