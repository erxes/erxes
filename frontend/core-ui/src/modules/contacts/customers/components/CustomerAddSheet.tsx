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
import { AddCustomerForm } from './AddCustomerForm';
import { useTranslation } from 'react-i18next';
export const CustomerAddSheet = () => {
  const { t } = useTranslation('contact');
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      ContactsHotKeyScope.CustomerAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(ContactsHotKeyScope.CustomersPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), ContactsHotKeyScope.CustomersPage);
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    ContactsHotKeyScope.CustomerAddSheet,
  );

  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('customer.add._')}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-lg p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddCustomerForm onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const CustomerAddSheetHeader = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>{t('_')}</Sheet.Title>
      <Sheet.Description className="sr-only">
        Add a new contact to your organization.
      </Sheet.Description>
      <Sheet.Close />
    </Sheet.Header>
  );
};
