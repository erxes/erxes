import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { ContactsBreadcrumb } from '../components/ContactsBreadcrumb';
import { ContactsPageHeader } from '../components/ContactsPageHeader';
import { useCreateHotkey } from '../customers/CustomersHeader';
import { ExportButton } from '~/modules/transfer/ExportButton';
import { ImportButton } from '~/modules/transfer/ImportButton';

/** Export with the list's quick filters (the advanced filter and search come from the address). */
const CompaniesExportButton = () => {
  const [{ tags, ownerId }] = useMultiQueryState<{ tags: string[]; ownerId: string }>([
    'tags',
    'ownerId',
  ]);

  return (
    <ExportButton
      recordType="company"
      query={{ tagIds: tags?.length ? tags : undefined, ownerId: ownerId || undefined }}
    />
  );
};

/** Opens a new company in the side panel as a draft; it is created on Save. */
export const CompanyCreateButton = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const { t } = useTranslation('contact');
  const { openNewRecord } = useSidePanel();

  const create = () => openNewRecord('core:company', { state });

  useCreateHotkey(create);

  return (
    <Button onClick={create}>
      <IconPlus />
      {state === 'lead' ? 'Add company lead' : t('company.add._', 'Add company')}
      <Kbd>C</Kbd>
    </Button>
  );
};

export const CompaniesHeader = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => (
  <ContactsPageHeader>
    <ContactsPageHeader.Start>
      <ContactsBreadcrumb />
    </ContactsPageHeader.Start>
    <ContactsPageHeader.End>
      <ImportButton recordType="company" />
      <CompaniesExportButton />
      <CompanyCreateButton state={state} />
    </ContactsPageHeader.End>
  </ContactsPageHeader>
);
