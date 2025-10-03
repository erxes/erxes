import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import CreateTmsForm from '@/tms/components/CreateTmsForm';

export const TmsCreateSheet = () => {
  const [open, setOpen] = useState<boolean>(false);

  const onOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Create TMS
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0 sm:max-w-8xl"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <CreateTmsForm onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const TmsCreateSheetHeader = () => {
  return (
    <Sheet.Header className="p-5 border-[#F4F4F5]">
      <Sheet.Title>Create Tour Management System</Sheet.Title>
      <Sheet.Close />
    </Sheet.Header>
  );
};
