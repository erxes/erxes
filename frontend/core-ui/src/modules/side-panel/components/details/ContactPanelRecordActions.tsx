import { BROADCAST_SELECTABLE_METHODS } from '@/broadcast/constants';
import { useBroadcastContacts } from '@/broadcast/hooks/useBroadcastContacts';
import { REMOVE_COMPANIES } from '@/contacts/companies/graphql/mutations/removeCompanies';
import { GET_COMPANIES } from '@/contacts/companies/graphql/queries/getCompanies';
import { CUSTOMERS_REMOVE } from '@/contacts/customers/graphql/mutations/removeCustomers';
import { GET_CUSTOMERS } from '@/contacts/customers/graphql/queries/getCustomers';
import { ContactsPath } from '@/types/paths/ContactsPath';
import { useMutation } from '@apollo/client';
import { IconDownload, IconSend, IconTrash } from '@tabler/icons-react';
import { Button, DropdownMenu, toast, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ExportFieldSelection,
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
  const isCustomer = contentType === 'core:customer';
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
      {isCustomer && hasActionPermission('broadcastCreate') && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button variant="outline">
              <IconSend />
              {broadcastT('actions.send-broadcast', 'Send broadcast')}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            {BROADCAST_SELECTABLE_METHODS.map(({ value, labelKey }) => (
              <DropdownMenu.Item
                key={value}
                onSelect={() => {
                  setContacts([contentId]);
                  const next = new URLSearchParams(params);
                  next.set('method', value);
                  navigate(
                    `${ContactsPath.Index}${ContactsPath.Customers}?${next}`,
                  );
                }}
              >
                {broadcastT(labelKey)}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
      {canExport && (
        <Button
          variant="outline"
          disabled={exporting}
          onClick={() => setExportOpen(true)}
        >
          <IconDownload />
          {exportT('export', 'Export')}
        </Button>
      )}
      {hasActionPermission('contactsDelete') && (
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
          disabled={removing}
          onClick={deleteContact}
        >
          <IconTrash />
          {t('action-delete', 'Delete')}
        </Button>
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
