import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { useIsCustomerLeadSessionKey } from '../hooks/useCustomerLeadSessionKey';

/**
 * Opens a new customer (or lead) in the side panel as a draft; it is
 * created once its first value is entered.
 */
export const CustomerCreateButton = () => {
  const { t } = useTranslation('contact');
  const { isLead } = useIsCustomerLeadSessionKey();
  const { openNewRecord } = useSidePanel();

  const create = () =>
    openNewRecord('core:customer', { state: isLead ? 'lead' : 'customer' });

  useScopedHotkeys('c', create, ContactsHotKeyScope.CustomersPage);

  return (
    <Button onClick={create}>
      <IconPlus />
      {isLead ? t('lead.add._') : t('customer.add._')}
      <Kbd>C</Kbd>
    </Button>
  );
};
