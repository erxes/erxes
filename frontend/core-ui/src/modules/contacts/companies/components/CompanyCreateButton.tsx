import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';

/**
 * Opens a new company in the side panel as a draft; it is created once its
 * first value is entered.
 */
export const CompanyCreateButton = () => {
  const { t } = useTranslation('contact');
  const { openNewRecord } = useSidePanel();

  const create = () => openNewRecord('core:company');

  useScopedHotkeys('c', create, ContactsHotKeyScope.CompaniesPage);

  return (
    <Button onClick={create}>
      <IconPlus />
      {t('company.add._', 'Add company')}
      <Kbd>C</Kbd>
    </Button>
  );
};
