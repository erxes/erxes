import { IconTable } from '@tabler/icons-react';
import type { Editor, Range } from '@tiptap/core';

/** The slash-command entry that drops a table into the email. */
export const tableBlock = {
  title: 'Table',
  description: 'Rows and columns of content',
  searchTerms: ['table', 'grid', 'rows', 'columns'],
  icon: <IconTable className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }: { editor: Editor; range: Range }) => {
    editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 2 }).run();
  },
};
