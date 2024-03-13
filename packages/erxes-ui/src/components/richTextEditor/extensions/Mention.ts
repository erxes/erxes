import Mention from '@tiptap/extension-mention';
import { mergeAttributes } from '@tiptap/core';

export const MentionExtended = Mention.extend({
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
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      [
        'strong',
        this.options.renderLabel({
          options: this.options,
          node,
        }),
      ],
    ];
  },
});
