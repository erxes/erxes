import { Mark, mergeAttributes } from '@tiptap/core';
export const SpanMark = Mark.create({
  name: 'spanMark',
  excludes: '',
  parseHTML() {
    return [
      { tag: 'span' },
      {
        tag: `span[data-type="mention"]`,
        skip: true,
        ignore: true,
      },
    ];
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
      class: {
        parseHTML: (element) => element.getAttribute('class'),
      },
      'data-type': {
        parseHTML: (element) => element.getAttribute('data-type'),
      },
      'data-id': {
        parseHTML: (element) => element.getAttribute('data-id'),
      },
      'data-label': {
        parseHTML: (element) => element.getAttribute('data-label'),
      },
    };
  },
});
