import TiptapMention from '@tiptap/extension-mention';
import { mergeAttributes } from '@tiptap/core';

export const Mention = TiptapMention.extend({
  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': this.name },
        HTMLAttributes,
        this.options.HTMLAttributes,
        node.attrs
      ),
      [
        'strong',
        this.options.renderText({
          options: this.options,
          node,
        }),
      ],
    ];
  },
});
