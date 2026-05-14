import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddCompanyForm } from './AddCompanyForm';

export const CompanyAddSheet = () => {
  const { t } = useTranslation('contact');
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      ContactsHotKeyScope.CompanyAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(ContactsHotKeyScope.CompaniesPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), ContactsHotKeyScope.CompaniesPage);
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    ContactsHotKeyScope.CompanyAddSheet,
  );

  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('company.add._', 'Add company')}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-lg p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddCompanyForm onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const CompanyAddSheetHeader = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company.add' });
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>{t('_', 'Add Company')}</Sheet.Title>
      <Sheet.Description className="sr-only">
        Add a new company
      </Sheet.Description>
      <Sheet.Close />
    </Sheet.Header>
  );
};
