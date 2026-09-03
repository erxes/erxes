import { useDocumentRemove } from '@/documents/hooks/useDocumentRemove';
import {
  IconDotsVertical,
  IconEdit,
  IconPrinter,
  IconTrash,
} from '@tabler/icons-react';
import {
  BlockEditorReadOnly,
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  toast,
  useConfirm,
  useSetQueryStateByKey,
} from 'erxes-ui';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Can } from 'ui-modules';

import { IDocument } from '../types';
import {
  DocumentPrintDialog,
  hasDocumentReplacerSelect,
} from './DocumentPrintDialog';

const printDocument = (documentItem: IDocument) => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    toast({
      title: 'Unable to print document',
      description: 'Allow popups in your browser and try again.',
      variant: 'destructive',
    });
    return;
  }

  printWindow.opener = null;
  printWindow.document.title = documentItem.name || 'Untitled';

  document
    .querySelectorAll('link[rel="stylesheet"], style')
    .forEach((style) =>
      printWindow.document.head.appendChild(style.cloneNode(true)),
    );

  const printStyles = printWindow.document.createElement('style');
  printStyles.textContent = `
    @page { margin: 16mm; }
    body { margin: 0; background: white; color: black; }
    .document-print-content { max-width: 210mm; margin: 0 auto; }
  `;
  printWindow.document.head.appendChild(printStyles);

  const container = printWindow.document.createElement('div');
  container.className = 'document-print-content';
  printWindow.document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <BlockEditorReadOnly
      content={documentItem.content || ''}
      className="p-0"
    />,
  );

  printWindow.addEventListener(
    'afterprint',
    () => {
      root.unmount();
      printWindow.close();
    },
    { once: true },
  );

  window.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 300);
};

export const DocumentsActions = ({
  documentItem,
  variant,
}: {
  documentItem: IDocument;
  variant: 'grid' | 'table';
}) => {
  const [open, setOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const setQuery = useSetQueryStateByKey();
  const { confirm } = useConfirm();
  const { removeDocument, loading } = useDocumentRemove();

  const handleEdit = () => {
    setOpen(false);
    setQuery('documentId', documentItem._id);
    setQuery('contentType', documentItem.contentType);
  };

  const handlePrint = () => {
    setOpen(false);

    if (hasDocumentReplacerSelect(documentItem.contentType)) {
      setPrintOpen(true);
      return;
    }

    printDocument(documentItem);
  };

  const handleDelete = () => {
    setOpen(false);
    void confirm({
      message: `Delete "${documentItem.name || 'Untitled'}"?`,
      options: {
        description:
          'This document will be permanently deleted. This action cannot be undone.',
        okLabel: 'Delete document',
      },
    }).then(() =>
      removeDocument({
        variables: { id: documentItem._id },
        refetchQueries: ['Documents'],
      }),
    );
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          {variant === 'table' ? (
            <RecordTable.MoreButton className="w-full h-full" />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="-mr-1 -mt-1 size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
              onClick={(event) => event.stopPropagation()}
            >
              <IconDotsVertical />
            </Button>
          )}
        </Popover.Trigger>
        <Combobox.Content onClick={(event) => event.stopPropagation()}>
          <Command shouldFilter={false}>
            <Command.List>
              <Can action="manageDocuments">
                <Command.Item value="edit" onSelect={handleEdit}>
                  <IconEdit /> Edit
                </Command.Item>
              </Can>
              <Command.Item value="print" onSelect={handlePrint}>
                <IconPrinter /> Print
              </Command.Item>
              <Can action="removeDocuments">
                <Command.Item
                  value="delete"
                  onSelect={handleDelete}
                  disabled={loading}
                  className="text-destructive"
                >
                  <IconTrash /> Delete
                </Command.Item>
              </Can>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <DocumentPrintDialog
        documentItem={documentItem}
        open={printOpen}
        onOpenChange={setPrintOpen}
      />
    </>
  );
};
