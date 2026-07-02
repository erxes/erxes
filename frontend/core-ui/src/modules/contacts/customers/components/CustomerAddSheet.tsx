import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { IconPlus } from '@tabler/icons-react';

import {
  Button,
  FocusSheet,
  Kbd,
  Sheet,
  Spinner,
  usePreviousHotkeyScope,
  useQueryState,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { Suspense, useState } from 'react';
import { AddCustomerForm } from './AddCustomerForm';
import { useTranslation } from 'react-i18next';
import { useIsCustomerLeadSessionKey } from '../hooks/useCustomerLeadSessionKey';
import { SheetNavSidebar } from 'ui-modules';

export const CustomerAddSheet = () => {
  const { t } = useTranslation('contact');
  const { isLead } = useIsCustomerLeadSessionKey();
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const [, setSelectedTab] = useQueryState<string>('tab');
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
    setSelectedTab(null);
  };

  useScopedHotkeys(`c`, () => onOpen(), ContactsHotKeyScope.CustomersPage);
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    ContactsHotKeyScope.CustomerAddSheet,
  );

  const title = isLead ? t('lead.add._') : t('customer.add._');

  return (
    <FocusSheet
      open={open}
      onOpenChange={(isOpen) => (isOpen ? onOpen() : onClose())}
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {title}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <FocusSheet.View className="w-[50%] md:w-[50%] lg:w-[50%]">
        <FocusSheet.Header title={title} />
        <FocusSheet.Content className="flex-1 min-h-0">
          <FocusSheet.SideBar>
            <SheetNavSidebar
              tabs={['overview', 'properties']}
              groupLabel={t('general', 'General')}
            />
          </FocusSheet.SideBar>
          <div className="flex overflow-hidden flex-col flex-1">
            <Suspense fallback={<Spinner />}>
              {open && <AddCustomerForm onOpenChange={setOpen} />}
            </Suspense>
          </div>
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
