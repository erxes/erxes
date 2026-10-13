import { useApolloClient } from '@apollo/client';
import { useDocumentRemove } from '@/documents/hooks/useDocumentRemove';
import {
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
import {
  DocumentPrintDialog,
  hasDocumentReplacerSelect,
} from './DocumentPrintDialog';
import { useTranslation } from 'react-i18next';

type DocumentsActionsMenuProps = {
  documentItem: IDocument;
  loading: boolean;
  open: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
  variant: 'grid' | 'table';
};

/** Offer approval lock controls in grid and record-table document menus. */
function DocumentLockMenuItem({
  documentItem,
}: Readonly<{ documentItem: IDocument }>) {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
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
            title: t('refresh-access-failed'),
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
        <IconLockOpen /> {t('unlock')}
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
          <IconLock /> {t('lock')}
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
}: Pick<
  DocumentsActionsMenuProps,
  'documentItem' | 'loading' | 'onDelete' | 'onEdit' | 'onPrint'
>) {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });

  return (
    <Command.List>
      <Can action="manageDocuments">
        <Command.Item value="edit" onSelect={onEdit}>
          <IconEdit /> {t('edit')}
        </Command.Item>
      </Can>
      <Command.Item value="print" onSelect={onPrint}>
        <IconPrinter /> {t('print')}
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
          <IconTrash /> {t('delete')}
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
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
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
      message: t('delete-title', {
        name: documentItem.name || t('untitled'),
      }),
      options: {
        description: t('delete-description'),
        okLabel: t('delete-document'),
      },
    }).then(() =>
      removeDocument({
        variables: { id: documentItem._id },
        refetchQueries: ['Documents'],
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
