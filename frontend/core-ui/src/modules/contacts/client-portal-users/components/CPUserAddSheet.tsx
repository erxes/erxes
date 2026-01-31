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
import { AddCPUserForm } from '@/contacts/client-portal-users/components/AddCPUserForm';
import { useTranslation } from 'react-i18next';

export const CPUserAddSheet = () => {
  const { t } = useTranslation('contact');
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      ContactsHotKeyScope.ClientPortalUserAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(ContactsHotKeyScope.ClientPortalUsersPage);
    setOpen(false);
  };

  useScopedHotkeys(
    `c`,
    () => onOpen(),
    ContactsHotKeyScope.ClientPortalUsersPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    ContactsHotKeyScope.ClientPortalUserAddSheet,
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => (isOpen ? onOpen() : onClose())}
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('clientPortalUser.add._', {
            defaultValue: 'Add client portal user',
          })}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-lg p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddCPUserForm onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const CPUserAddSheetHeader = () => {
  const { t } = useTranslation('contact');
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>
        {t('clientPortalUser.add._', {
          defaultValue: 'Add client portal user',
        })}
      </Sheet.Title>
      <Sheet.Description className="sr-only">
        {t('clientPortalUser.add.description', {
          defaultValue: 'Create a new client portal user',
        })}
      </Sheet.Description>
      <Sheet.Close />
    </Sheet.Header>
  );
};
