import { IconPlus } from '@tabler/icons-react';
import { TicketHotKeyScope } from '@/ticket/types/ticketHotkeyScope';
import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { AddTicketForm } from '@/ticket/components/add-ticket/AddTicketForm'; 
import { useAtom } from 'jotai';
import { ticketCreateSheetState } from '@/ticket/states/ticketCreateSheetState';

export const AddTicketSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useAtom(ticketCreateSheetState);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(TicketHotKeyScope.TicketAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(TicketHotKeyScope.TicketAddSheet);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), TicketHotKeyScope.TicketPage);
  useScopedHotkeys(`esc`, () => onClose(), TicketHotKeyScope.TicketAddSheet);

  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add ticket
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-3xl w-full p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddTicketForm onClose={onClose} />
      </Sheet.View>
    </Sheet>
  );
};

export const AddTicketSheetHeader = () => {
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>Add ticket</Sheet.Title>
      <Sheet.Description className="sr-only">
        Add a new ticket to your organization.
      </Sheet.Description>
      <Sheet.Close />
    </Sheet.Header>
  );
};
