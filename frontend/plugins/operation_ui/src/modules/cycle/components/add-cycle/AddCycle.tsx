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
          Add cycle
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
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>Add cycle</Sheet.Title>
      <Sheet.Description className="sr-only">
        Add a new cycle to your organization.
      </Sheet.Description>
      <Sheet.Close />
    </Sheet.Header>
  );
};
