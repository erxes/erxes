import {
  DocumentPickerDialog,
  getDocumentPreview,
  type EmailDocument,
} from '@/documents/components/DocumentPickerDialog';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { IconFileText } from '@tabler/icons-react';
import type { IBlockEditor } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const insertDocumentPlaceholderBlock = (
  editor: IBlockEditor,
  document: EmailDocument,
) => {
  const currentBlock = editor.getTextCursorPosition().block;
  const block = {
    type: 'documentPlaceholder',
    props: {
      documentId: document._id,
      documentName: document.name || 'Untitled document',
      documentCode: document.code || '',
      documentPreview: getDocumentPreview(document.content),
    },
  } as Parameters<IBlockEditor['insertBlocks']>[0][number];

  editor.insertBlocks([block], currentBlock, 'after');
  editor.focus();
};

export const useEmailDocumentPlaceholder = ({
  editor,
}: {
  editor: IBlockEditor;
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('automations');

  const additionalSlashMenuItems = useMemo<DefaultReactSuggestionItem[]>(
    () => [
      {
        title: t('document-placeholder'),
        subtext: t('document-placeholder-description'),
        aliases: ['document', 'doc', 'file'],
        group: t('email-content'),
        icon: <IconFileText size={18} />,
        onItemClick: () => {
          editor.suggestionMenus.clearQuery();
          editor.suggestionMenus.closeMenu();
          setOpen(true);
        },
      },
    ],
    [editor, t],
  );

  return {
    additionalSlashMenuItems,
    documentPlaceholderPicker: (
      <DocumentPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={(document) =>
          insertDocumentPlaceholderBlock(editor, document)
        }
      />
    ),
  };
};
