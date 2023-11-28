import { Node } from '@tiptap/react';

export const StyleNode = Node.create({
  name: 'styletag',
  content: 'text*',
  parseDOM: [{ tag: 'style' }],
  renderHTML: ({ HTMLAttributes }) => ['style', HTMLAttributes, 0]
});
