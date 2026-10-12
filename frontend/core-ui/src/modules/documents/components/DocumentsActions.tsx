import { useApolloClient, useMutation } from '@apollo/client';
import { useDocumentRemove } from '@/documents/hooks/useDocumentRemove';
import {
  IconDotsVertical,
  IconEdit,
  IconCopy,
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
  useMultiQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import {
  ApprovalLockDialog,
  Can,
  PrintDocument,
  useApprovalLock,
  DOCUMENTS_QUERY,
} from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';

import { IDocument } from '../types';
import { DUPLICATE_DOCUMENT } from '../graphql/documentMutations';
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
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
  onDuplicate: () => void;
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
  onEdit,
  onPrint,
  onDuplicate,
}: Pick<
  DocumentsActionsMenuProps,
  'documentItem' | 'loading' | 'onDelete' | 'onEdit' | 'onPrint' | 'onDuplicate'
>) {
  return (
    <Command.List>
      <Can action="manageDocuments">
        <Command.Item value="edit" onSelect={onEdit}>
          <IconEdit /> Edit
        </Command.Item>
        <Command.Item value="duplicate" onSelect={onDuplicate}>
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
  onEdit,
  onOpenChange,
  onPrint,
  onDuplicate,
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
            onEdit={onEdit}
            onPrint={onPrint}
            onDuplicate={onDuplicate}
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
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [, setQueries] = useMultiQueryState<{
    documentId: string;
    contentType: string;
  }>(['documentId', 'contentType']);
  const [duplicateDocument, { loading: duplicating }] = useMutation<{
    documentsDuplicate: IDocument;
  }>(DUPLICATE_DOCUMENT);
  const { confirm } = useConfirm();
  const { removeDocument, loading } = useDocumentRemove();

  function handleEdit() {
    setOpen(false);
    setQueries({
      documentId: documentItem._id,
      contentType: documentItem.contentType,
    });
  }

  function handlePrint() {
    setOpen(false);
    setPrintOpen(true);
  }

  async function handleDuplicate(contentType: string): Promise<void> {
    try {
      const { data } = await duplicateDocument({
        variables: { _id: documentItem._id, contentType },
        refetchQueries: [GET_DOCUMENTS, DOCUMENTS_QUERY],
        awaitRefetchQueries: true,
      });
      if (data?.documentsDuplicate) {
        setDuplicateOpen(false);
        setQueries({ documentId: data.documentsDuplicate._id, contentType });
        toast({ title: 'Document duplicated', variant: 'success' });
      }
    } catch (error) {
      toast({
        title: 'Could not duplicate document',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
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
        refetchQueries: [GET_DOCUMENTS, DOCUMENTS_QUERY],
      }),
    );
  }

  if (documentItem.approvalLockState?.hasAccess === false) {
    return null;
  }

  return (
    <>
      <DocumentsActionsMenu
        documentItem={documentItem}
        loading={loading}
        open={open}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onOpenChange={setOpen}
        onPrint={handlePrint}
        onDuplicate={() => {
          setOpen(false);
          setDuplicateOpen(true);
        }}
        variant={variant}
      />
      {duplicateOpen && (
        <DocumentTypeDialog
          open={duplicateOpen}
          onOpenChange={setDuplicateOpen}
          onSelect={handleDuplicate}
          initialContentType={documentItem.contentType}
          duplicate
          loading={duplicating}
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
    </>
  );
}
