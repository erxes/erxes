import type { CustomerState } from '@erxes/core-contract';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePageHotkey } from '~/lib/usePageHotkey';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { ContactsBreadcrumb } from '../components/ContactsBreadcrumb';
import { ContactsPageHeader } from '../components/ContactsPageHeader';
import { ExportButton } from '~/modules/transfer/ExportButton';
import { ImportButton } from '~/modules/transfer/ImportButton';

/** `C` adds a record. */
export const useCreateHotkey = (action: () => void) => usePageHotkey('c', action);

/**
 * Opens a new customer (or lead) in the side panel as a draft; it is created
 * on Save.
 */
const CustomerCreateButton = ({ state }: { state: CustomerState }) => {
  const { t } = useTranslation('contact');
  const { openNewRecord } = useSidePanel();
  const isLead = state === 'lead';

  const create = () => openNewRecord('core:customer', { state });

  useCreateHotkey(create);

  return (
    <Button onClick={create}>
      <IconPlus />
      {isLead ? t('lead.add._') : t('customer.add._')}
      <Kbd>C</Kbd>
    </Button>
  );
};

export const CustomersHeader = ({ state }: { state: CustomerState }) => (
  <ContactsPageHeader>
    <ContactsPageHeader.Start>
      <ContactsBreadcrumb />
    </ContactsPageHeader.Start>
    <ContactsPageHeader.End>
      <ImportButton recordType={state} />
      <ExportButton recordType={state} />
      <CustomerCreateButton state={state} />
    </ContactsPageHeader.End>
  </ContactsPageHeader>
);
