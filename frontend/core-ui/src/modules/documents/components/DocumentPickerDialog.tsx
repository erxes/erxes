import { IconFileText, IconX } from '@tabler/icons-react';
import { Button, Command, Dialog, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useDocuments } from 'ui-modules';

export interface EmailDocument {
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

export const getDocumentPreview = (content?: string) => {
  if (!content) {
    return '';
  }

  try {
    return normalizePreview(collectBlockText(JSON.parse(content)).join(' '));
  } catch {
    return normalizePreview(content.replace(/<[^>]*>/g, ' '));
  }
};

/**
 * Picking a document is the same question in every editor, so both the block
 * editor and the email editor ask it here and only differ in what they insert.
 */
export const DocumentPickerDialog = ({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (document: EmailDocument) => void;
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
    onSelect(document);
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
