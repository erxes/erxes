import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { ContactsBreadcrumb } from '../components/ContactsBreadcrumb';
import { ContactsPageHeader } from '../components/ContactsPageHeader';
import { useCreateHotkey } from '../customers/CustomersHeader';

/** Opens a new company in the side panel as a draft; it is created on Save. */
export const CompanyCreateButton = () => {
  const { t } = useTranslation('contact');
  const { openNewRecord } = useSidePanel();

  const create = () => openNewRecord('core:company');

  useCreateHotkey(create);

  return (
    <Button onClick={create}>
      <IconPlus />
      {t('company.add._', 'Add company')}
      <Kbd>C</Kbd>
    </Button>
  );
};

export const CompaniesHeader = () => (
  <ContactsPageHeader>
    <ContactsPageHeader.Start>
      <ContactsBreadcrumb />
    </ContactsPageHeader.Start>
    <ContactsPageHeader.End>
      <CompanyCreateButton />
    </ContactsPageHeader.End>
  </ContactsPageHeader>
);
