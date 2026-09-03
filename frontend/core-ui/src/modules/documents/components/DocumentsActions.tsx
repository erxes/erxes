import { useDocumentRemove } from '@/documents/hooks/useDocumentRemove';
import {
  IconDotsVertical,
  IconEdit,
  IconPrinter,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useSetQueryStateByKey,
} from 'erxes-ui';
import { useState } from 'react';
import { Can, PrintDocument } from 'ui-modules';

import { IDocument } from '../types';
import {
  DocumentPrintDialog,
  hasDocumentReplacerSelect,
} from './DocumentPrintDialog';

type DocumentsActionsMenuProps = {
  loading: boolean;
  open: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
  variant: 'grid' | 'table';
};

function DocumentsActionsList({
  loading,
  onDelete,
  onEdit,
  onPrint,
}: Pick<
  DocumentsActionsMenuProps,
  'loading' | 'onDelete' | 'onEdit' | 'onPrint'
>) {
  return (
    <Command.List>
      <Can action="manageDocuments">
        <Command.Item value="edit" onSelect={onEdit}>
          <IconEdit /> Edit
        </Command.Item>
      </Can>
      <Command.Item value="print" onSelect={onPrint}>
        <IconPrinter /> Print
      </Command.Item>
      <Can action="removeDocuments">
        <Command.Item
          value="delete"
          onSelect={onDelete}
          disabled={loading}
          className="text-destructive"
        >
          <IconTrash /> Delete
        </Command.Item>
      </Can>
    </Command.List>
  );
}

function DocumentsActionsMenu({
  loading,
  open,
  onDelete,
  onEdit,
  onOpenChange,
  onPrint,
  variant,
}: DocumentsActionsMenuProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
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
          <DocumentsActionsList
            loading={loading}
            onDelete={onDelete}
            onEdit={onEdit}
            onPrint={onPrint}
          />
        </Command>
      </Combobox.Content>
    </Popover>
  );
}

export function DocumentsActions({
  documentItem,
  variant,
}: {
  documentItem: IDocument;
  variant: 'grid' | 'table';
}) {
  const [open, setOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const setQuery = useSetQueryStateByKey();
  const { confirm } = useConfirm();
  const { removeDocument, loading } = useDocumentRemove();

  function handleEdit() {
    setOpen(false);
    setQuery('documentId', documentItem._id);
    setQuery('contentType', documentItem.contentType);
  }

  function handlePrint() {
    setOpen(false);
    setPrintOpen(true);
  }

  function handleDelete() {
    setOpen(false);
    confirm({
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
  }

  return (
    <>
      <DocumentsActionsMenu
        loading={loading}
        open={open}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onOpenChange={setOpen}
        onPrint={handlePrint}
        variant={variant}
      />
      {hasDocumentReplacerSelect(documentItem.contentType) ? (
        <DocumentPrintDialog
          documentItem={documentItem}
          open={printOpen}
          onOpenChange={setPrintOpen}
        />
      ) : (
        <PrintDocument
          items={[]}
          contentType={documentItem.contentType}
          document={{
            _id: documentItem._id,
            name: documentItem.name,
          }}
          open={printOpen}
          onOpenChange={setPrintOpen}
          trigger={null}
        />
      )}
    </>
  );
}
