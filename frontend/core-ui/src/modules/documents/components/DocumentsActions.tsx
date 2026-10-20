import { useDocumentActions } from '../hooks/useDocumentActions';
import { useDocumentAccessRefresh } from '../hooks/useDocumentAccessRefresh';
import {
  IconDotsVertical,
  IconEdit,
  IconCopy,
  IconLock,
  IconLockOpen,
  IconPrinter,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import {
  ApprovalLockDialog,
  Can,
  PrintDocument,
  useApprovalLock,
} from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';

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
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
  onDuplicate: () => void;
  variant: 'grid' | 'table';
};

function DocumentLockMenuItem({
  documentItem,
}: Readonly<{ documentItem: IDocument }>) {
  const refreshAccess = useDocumentAccessRefresh();
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
    onChanged: refreshAccess,
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
  const {
    open,
    setOpen,
    printOpen,
    setPrintOpen,
    duplicateOpen,
    setDuplicateOpen,
    loading,
    duplicating,
    handleEdit,
    handlePrint,
    handleOpenDuplicate,
    handleDuplicate,
    handleDelete,
  } = useDocumentActions(documentItem);

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
        onDuplicate={handleOpenDuplicate}
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
