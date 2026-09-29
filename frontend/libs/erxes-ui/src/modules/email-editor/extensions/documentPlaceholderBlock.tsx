import { IconFileText } from '@tabler/icons-react';
import type { Editor, Range } from '@tiptap/core';
import type { EditorProps as MailyEditorProps } from '@maily-to/core';
import { DEFAULT_EMAIL_BLOCKS } from '../constant';

type BlockGroups = NonNullable<MailyEditorProps['blocks']>;

/**
 * Which document to embed is answered outside the editor, so the entry hands
 * the editor back to whoever opens the picker and inserts nothing itself.
 */
export const createDocumentPlaceholderBlock = (
  onOpen: (editor: Editor) => void,
) => ({
  title: 'Document',
  description: 'Render a document into the email',
  searchTerms: ['document', 'doc', 'template', 'file'],
  icon: <IconFileText className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }: { editor: Editor; range: Range }) => {
    editor.chain().focus().deleteRange(range).run();
    onOpen(editor);
  },
});

export const withEmailDocumentBlock = (
  onOpen: (editor: Editor) => void,
  blocks: BlockGroups = DEFAULT_EMAIL_BLOCKS,
): BlockGroups =>
  blocks.map((group) =>
    group.title === 'Design'
      ? {
          ...group,
          commands: [...group.commands, createDocumentPlaceholderBlock(onOpen)],
        }
      : group,
  );
