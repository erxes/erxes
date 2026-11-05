import { BROADCAST_SELECTABLE_METHODS } from '@/broadcast/constants';
import { useBroadcastContacts } from '@/broadcast/hooks/useBroadcastContacts';
import { REMOVE_COMPANIES } from '@/contacts/companies/graphql/mutations/removeCompanies';
import { GET_COMPANIES } from '@/contacts/companies/graphql/queries/getCompanies';
import { CUSTOMERS_REMOVE } from '@/contacts/customers/graphql/mutations/removeCustomers';
import { GET_CUSTOMERS } from '@/contacts/customers/graphql/queries/getCustomers';
import { ContactsPath } from '@/types/paths/ContactsPath';
import { useMutation } from '@apollo/client';
import {
  IconArrowLeft,
  IconChevronRight,
  IconDotsVertical,
  IconDownload,
  IconPrinter,
  IconSend,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Command, Popover, toast, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ExportFieldSelection,
  PrintDocument,
  useExport,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';

/** Uses the list's broadcast, export and removal workflows for one record. */
export const ContactPanelRecordActions = ({
  contentType,
  contentId,
}: {
  contentType: 'core:customer' | 'core:company';
  contentId: string;
}) => {
  const { t } = useTranslation('contact');
  const { t: exportT } = useTranslation('importExport');
  const { t: broadcastT } = useTranslation('broadcasts');
  const { hasActionPermission } = usePermissionCheck();
  const { close } = useSidePanel();
  const { confirm } = useConfirm();
  const { setContacts } = useBroadcastContacts();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [exportOpen, setExportOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [view, setView] = useState<'main' | 'broadcast'>('main');
  const canPrint = hasActionPermission('documentsRead');
  const isCustomer = contentType === 'core:customer';
  const canBroadcast = isCustomer && hasActionPermission('broadcastCreate');
  const canDelete = hasActionPermission('contactsDelete');
  const entityType = isCustomer
    ? 'core:contacts.customers'
    : 'core:contacts.companies';
  const canExport = hasActionPermission(
    isCustomer ? 'customersExportManage' : 'companiesExportManage',
  );
  const { loading: exporting, onFieldSelectionConfirm } = useExport({
    entityType,
    ids: [contentId],
    confirmMessage: exportT('export-confirm'),
  });
  const [remove, { loading: removing }] = useMutation(
    isCustomer ? CUSTOMERS_REMOVE : REMOVE_COMPANIES,
    {
      refetchQueries: [isCustomer ? GET_CUSTOMERS : GET_COMPANIES],
      update: (cache) => {
        cache.evict({
          id: cache.identify({
            __typename: isCustomer ? 'Customer' : 'Company',
            _id: contentId,
          }),
        });
        cache.gc();
      },
      onCompleted: () => {
        close();
        toast({
          title: t('deleted-success', 'Contact deleted'),
          variant: 'success',
        });
      },
      onError: (error) =>
        toast({
          title: t('error-title', 'Unable to delete contact'),
          description: error.message,
          variant: 'destructive',
        }),
    },
  );
  const deleteContact = async () => {
    try {
      await confirm({
        message: t('confirm-delete-contact', 'Delete this contact?'),
      });
    } catch {
      return;
    }
    await remove({
      variables: isCustomer
        ? { customerIds: [contentId] }
        : { companyIds: [contentId] },
    }).catch(() => undefined);
  };

  return (
    <>
      {(canPrint || canBroadcast || canExport || canDelete) && (
        <Popover
          open={actionsOpen}
          onOpenChange={(open) => {
            setActionsOpen(open);
            if (!open) setView('main');
          }}
        >
          <Popover.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t('actions', 'Actions')}
              title={t('actions', 'Actions')}
            >
              <IconDotsVertical className="size-4" />
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="min-w-[280px] p-0"
            align="end"
            side="bottom"
            sideOffset={8}
            onCloseAutoFocus={(event) => {
              if (printOpen || exportOpen) event.preventDefault();
            }}
          >
            {view === 'main' ? (
              <Command>
                <Command.List className="p-0">
                  <Command.Empty>
                    {t('no-actions', 'No actions found.')}
                  </Command.Empty>
                  {(canPrint || canBroadcast || canExport) && (
                    <Command.Group className="p-1">
                      {canPrint && (
                        <Command.Item
                          onSelect={() => {
                            setActionsOpen(false);
                            setPrintOpen(true);
                          }}
                        >
                          <IconPrinter />
                          {t('print', 'Print')}
                        </Command.Item>
                      )}
                      {canBroadcast && (
                        <Command.Item onSelect={() => setView('broadcast')}>
                          <IconSend />
                          {broadcastT(
                            'actions.send-broadcast',
                            'Send broadcast',
                          )}
                          <IconChevronRight className="ml-auto size-4" />
                        </Command.Item>
                      )}
                      {canExport && (
                        <Command.Item
                          disabled={exporting}
                          onSelect={() => {
                            setActionsOpen(false);
                            setExportOpen(true);
                          }}
                        >
                          <IconDownload />
                          {exportT('export', 'Export')}
                        </Command.Item>
                      )}
                    </Command.Group>
                  )}
                  {canDelete && (
                    <>
                      {(canPrint || canBroadcast || canExport) && (
                        <Command.Separator />
                      )}
                      <Command.Group className="p-1">
                        <Command.Item
                          className="text-destructive"
                          disabled={removing}
                          onSelect={() => {
                            setActionsOpen(false);
                            void deleteContact();
                          }}
                        >
                          <IconTrash />
                          {t('action-delete', 'Delete')}
                        </Command.Item>
                      </Command.Group>
                    </>
                  )}
                </Command.List>
              </Command>
            ) : (
              <Command>
                <Command.List className="p-0">
                  <Command.Group className="p-1">
                    <Command.Item onSelect={() => setView('main')}>
                      <IconArrowLeft />
                      {broadcastT('actions.send-broadcast', 'Send broadcast')}
                    </Command.Item>
                  </Command.Group>
                  <Command.Separator />
                  <Command.Group className="p-1">
                    {BROADCAST_SELECTABLE_METHODS.map(({ value, labelKey }) => (
                      <Command.Item
                        key={value}
                        onSelect={() => {
                          setActionsOpen(false);
                          setView('main');
                          setContacts([contentId]);
                          const next = new URLSearchParams(params);
                          next.set('method', value);
                          navigate(
                            `${ContactsPath.Index}${ContactsPath.Customers}?${next}`,
                          );
                        }}
                      >
                        {broadcastT(labelKey)}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>
              </Command>
            )}
          </Popover.Content>
        </Popover>
      )}
      {canPrint && (
        <PrintDocument
          items={[{ _id: contentId }]}
          contentType={
            isCustomer ? 'core:contact.customer' : 'core:contact.company'
          }
          open={printOpen}
          onOpenChange={setPrintOpen}
          trigger={null}
        />
      )}
      {canExport && (
        <ExportFieldSelection
          entityType={entityType}
          open={exportOpen}
          onOpenChange={setExportOpen}
          onConfirm={onFieldSelectionConfirm}
          recordCount={1}
        />
      )}
    </>
  );
};
