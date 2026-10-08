import { useApolloClient } from '@apollo/client';
import { useDocumentRemove } from '@/documents/hooks/useDocumentRemove';
import { useDocumentDuplicate } from '@/documents/hooks/useDocumentDuplicate';
import {
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconLock,
  IconLockOpen,
  IconPrinter,
  IconTrash,
} from '@tabler/icons-react';
import {
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
import {
  ApprovalLockDialog,
  Can,
  PrintDocument,
  useApprovalLock,
} from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';

import { IDocument } from '../types';
import { DocumentTypeDialog } from './DocumentTypeDialog';
import {
  DocumentPrintDialog,
  hasDocumentReplacerSelect,
} from './DocumentPrintDialog';

type DocumentsActionsMenuProps = {
  documentItem: IDocument;
  loading: boolean;
  open: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
  variant: 'grid' | 'table';
};

function DocumentLockMenuItem({
  documentItem,
}: Readonly<{ documentItem: IDocument }>) {
  const client = useApolloClient();
  const {
    open,
    setOpen,
    isLocked,
    canRelease,
    loading,
    form,
    onCreate,
    onRelease,
  } = useApprovalLock({
    contentType: DOCUMENT_APPROVAL_CONTENT_TYPE,
    contentId: documentItem._id,
    ownerId: documentItem.createdUser?._id,
    action: 'edit',
    onChanged: () => {
      client
        .refetchQueries({
          include: [GET_DOCUMENTS, GET_DOCUMENT_DETAIL, 'ApprovalLockState'],
        })
        .catch(() => {
          toast({
            title: 'Could not refresh document access',
            variant: 'destructive',
          });
        });
    },
  });

  if (isLocked) {
    return (
      <Command.Item
        value="unlock"
        disabled={!canRelease || loading}
        onSelect={onRelease}
      >
        <IconLockOpen /> Unlock
      </Command.Item>
    );
  }

  return (
    <ApprovalLockDialog
      form={form}
      loading={loading}
      onCreate={onCreate}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Command.Item
          value="lock"
          disabled={loading}
          onSelect={() => setOpen(true)}
        >
          <IconLock /> Lock
        </Command.Item>
      }
    />
  );
}

function DocumentsActionsList({
  documentItem,
  loading,
  onDelete,
  onDuplicate,
  onEdit,
  onPrint,
}: Pick<
  DocumentsActionsMenuProps,
  'documentItem' | 'loading' | 'onDelete' | 'onDuplicate' | 'onEdit' | 'onPrint'
>) {
  return (
    <Command.List>
      <Can action="manageDocuments">
        <Command.Item value="edit" onSelect={onEdit}>
          <IconEdit /> Edit
        </Command.Item>
        <Command.Item
          value="duplicate"
          onSelect={onDuplicate}
          disabled={loading}
        >
          <IconCopy /> Duplicate
        </Command.Item>
      </Can>
      <Command.Item value="print" onSelect={onPrint}>
        <IconPrinter /> Print
      </Command.Item>
      <Can action="manageDocuments">
        <DocumentLockMenuItem documentItem={documentItem} />
      </Can>
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
  documentItem,
  loading,
  open,
  onDelete,
  onDuplicate,
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
            documentItem={documentItem}
            loading={loading}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
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
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const setQuery = useSetQueryStateByKey();
  const { confirm } = useConfirm();
  const { removeDocument, loading } = useDocumentRemove();
  const { duplicateDocument, loading: duplicating } = useDocumentDuplicate();

  function handleDuplicate() {
    setOpen(false);
    setDuplicateOpen(true);
  }

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
      }),
    );
  }

  if (documentItem.approvalLockState?.hasAccess === false) {
    return null;
  }

  return (
    <div className="contents" onClick={(event) => event.stopPropagation()}>
      <DocumentsActionsMenu
        documentItem={documentItem}
        loading={loading || duplicating}
        open={open}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onEdit={handleEdit}
        onOpenChange={setOpen}
        onPrint={handlePrint}
        variant={variant}
      />
      {duplicateOpen && (
        <DocumentTypeDialog
          open
          onOpenChange={setDuplicateOpen}
          duplicating
          initialType={documentItem.contentType}
          loading={duplicating}
          onSelect={(contentType) =>
            duplicateDocument(documentItem._id, contentType)
          }
        />
      )}
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
    </div>
  );
}
