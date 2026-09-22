import { IconShoppingBag } from '@tabler/icons-react';
import type { Editor, Range } from '@tiptap/core';

/**
 * Meant to sit inside a repeat block: one card per item of the list it walks.
 */
export const productCardBlock = {
  title: 'Product card',
  description: 'One item of a repeated list',
  searchTerms: ['product', 'card', 'item', 'order', 'repeat'],
  icon: <IconShoppingBag className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }: { editor: Editor; range: Range }) => {
    editor.chain().focus().deleteRange(range).insertProductCard().run();
  },
};
