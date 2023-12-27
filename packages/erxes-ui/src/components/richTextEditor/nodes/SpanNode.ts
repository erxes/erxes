import { mergeAttributes } from '@tiptap/react';
import { Node } from '@tiptap/core';

export const SpanNode = Node.create({
  name: 'customSpan',
  inline: true,
  group: 'inline',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'span' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ];
  }
});
