import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { IconFileText, IconX } from '@tabler/icons-react';
import { Button, Command, Dialog, Spinner } from 'erxes-ui';
import type { IBlockEditor } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useDocuments } from 'ui-modules';

interface EmailDocument {
  _id: string;
  name?: string;
  code?: string;
  content?: string;
}

const normalizePreview = (value: string) =>
  value.replace(/\s+/g, ' ').trim().slice(0, 180);

const collectBlockText = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectBlockText);
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const record = value as Record<string, unknown>;
  const texts: string[] = [];

  if (typeof record.text === 'string') {
    texts.push(record.text);
  }

  if ('content' in record) {
    texts.push(...collectBlockText(record.content));
  }

  if ('children' in record) {
    texts.push(...collectBlockText(record.children));
  }

  return texts;
};

const getDocumentPreview = (content?: string) => {
  if (!content) {
    return '';
  }

  try {
    return normalizePreview(collectBlockText(JSON.parse(content)).join(' '));
  } catch {
    return normalizePreview(content.replace(/<[^>]*>/g, ' '));
  }
};

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
      <EmailDocumentPlaceholderPicker
        editor={editor}
        open={open}
        onOpenChange={setOpen}
      />
    ),
  };
};

const EmailDocumentPlaceholderPicker = ({
  editor,
  open,
  onOpenChange,
}: {
  editor: IBlockEditor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('automations');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const {
    documents = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useDocuments({
    variables: {
      searchValue: debouncedSearch,
    },
    skip: !open,
  });

  const hasMore = totalCount > documents.length;

  const handleSelect = (document: EmailDocument) => {
    insertDocumentPlaceholderBlock(editor, document);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-xl overflow-hidden p-0">
        <Dialog.Header className="relative border-b px-4 py-3 pr-12">
          <Dialog.Title>{t('select-document')}</Dialog.Title>
          <Dialog.Description>
            {t('select-document-description')}
          </Dialog.Description>
          <Dialog.Close asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-3"
            >
              <IconX />
            </Button>
          </Dialog.Close>
        </Dialog.Header>

        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            variant="secondary"
            placeholder={t('search-documents')}
            focusOnMount
          />
          <Command.List className="max-h-80">
            <Command.Empty>
              {loading ? t('loading-documents') : t('no-documents-found')}
            </Command.Empty>
            {documents.map((document: EmailDocument) => (
              <Command.Item
                key={document._id}
                value={document._id}
                className="h-auto items-start gap-3 px-3 py-2"
                onSelect={() => handleSelect(document)}
              >
                <IconFileText className="mt-0.5 size-4 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {document.name || t('untitled-document')}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {getDocumentPreview(document.content) ||
                      document.code ||
                      t('document-placeholder')}
                  </div>
                </div>
              </Command.Item>
            ))}
            {loading && documents.length > 0 && (
              <div className="flex items-center justify-center p-3">
                <Spinner size="sm" />
              </div>
            )}
            {hasMore && (
              <div className="border-t p-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleFetchMore}
                >
                  {t('load-more')}
                </Button>
              </div>
            )}
          </Command.List>
        </Command>
      </Dialog.Content>
    </Dialog>
  );
};
