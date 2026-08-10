import { useTranslation } from 'react-i18next';
import { IconPlus } from '@tabler/icons-react';
import { CycleHotKeyScope } from '@/cycle/CycleHotkeyScope';
import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { AddCycleForm } from '@/cycle/components/add-cycle/AddCycleForm';

export const AddCycleSheet = () => {
  const { t } = useTranslation('operation');
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(CycleHotKeyScope.CycleAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(CycleHotKeyScope.CycleAddSheet);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), CycleHotKeyScope.CyclesPage);
  useScopedHotkeys(`esc`, () => onClose(), CycleHotKeyScope.CycleAddSheet);

  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-cycle')}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-3xl w-full p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddCycleForm onClose={onClose} />
      </Sheet.View>
    </Sheet>
  );
};

export const AddCycleSheetHeader = () => {
  const { t } = useTranslation('operation');
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>{t('add-cycle')}</Sheet.Title>
      <Sheet.Description className="sr-only">
        {t('add-a-new-cycle')}
      </Sheet.Description>
      <Sheet.Close />
    </Sheet.Header>
  );
};
