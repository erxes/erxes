import type { CustomerState } from '@erxes/core-contract';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePageHotkey } from '~/lib/usePageHotkey';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { ContactsBreadcrumb } from '../components/ContactsBreadcrumb';
import { ExportButton } from '~/modules/transfer/ExportButton';
import { ImportButton } from '~/modules/transfer/ImportButton';

/**
 * Opens a new customer (or lead) in the side panel as a draft; it is created
 * on Save.
 */
const CustomerCreateButton = ({ state }: { state: CustomerState }) => {
  const { t } = useTranslation('contact');
  const { openNewRecord } = useSidePanel();
  const isLead = state === 'lead';

  const create = () => openNewRecord('core:customer', { state });

  usePageHotkey('c', create);

  return (
    <Button onClick={create}>
      <IconPlus />
      {isLead ? t('lead.add._') : t('customer.add._')}
      <Kbd>C</Kbd>
    </Button>
  );
};

export const CustomersHeader = ({ state }: { state: CustomerState }) => (
  <PageHeader>
    <PageHeader.Start variant="flush">
      <ContactsBreadcrumb />
    </PageHeader.Start>
    <PageHeader.End>
      <ImportButton recordType={state} />
      <ExportButton recordType={state} />
      <CustomerCreateButton state={state} />
    </PageHeader.End>
  </PageHeader>
);
