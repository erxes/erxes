import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { useCreateCustomerRecord } from '@/contacts/customers/hooks/useCreateCustomerRecord';
import { justCreatedRecordState } from '@/side-panel/states/justCreatedRecordState';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, Spinner, useScopedHotkeys } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { useIsCustomerLeadSessionKey } from '../hooks/useCustomerLeadSessionKey';

/**
 * Creates an empty customer (or lead) right away, adds it to the top of the
 * table, and opens it in the side panel to be filled in place.
 */
export const CustomerCreateButton = () => {
  const { t } = useTranslation('contact');
  const { isLead } = useIsCustomerLeadSessionKey();
  const { openRecord } = useSidePanel();
  const setJustCreated = useSetAtom(justCreatedRecordState);
  const { createCustomerRecord, loading } = useCreateCustomerRecord();

  const create = async () => {
    if (loading) return;

    const { data } = await createCustomerRecord(isLead ? 'lead' : 'customer');
    const createdId = data?.customersAdd._id;

    if (createdId) {
      setJustCreated(createdId);
      openRecord({ contentType: 'core:customer', contentId: createdId });
    }
  };

  useScopedHotkeys('c', create, ContactsHotKeyScope.CustomersPage);

  return (
    <Button onClick={create} disabled={loading}>
      {loading ? <Spinner size="sm" /> : <IconPlus />}
      {isLead ? t('lead.add._') : t('customer.add._')}
      <Kbd>C</Kbd>
    </Button>
  );
};
