import { IconPlus } from '@tabler/icons-react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SpinTabs } from '../add-spin-campaign/components/SpinTabs';
import { spinFormSchema, SpinFormValues } from '../constants/spinFormSchema';
import { SpinHotKeyScope } from '../types/SpinHotKeyScope';

export const LoyaltySpinAddSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const form = useForm<SpinFormValues>({
    resolver: zodResolver(spinFormSchema),
    defaultValues: {
      title: '',
      status: 'active',
      buyScore: 0,

      awards: [
        {
          name: '',
          voucherCampaignId: '',
          probablity: 0,
        },
      ],
    },
  });

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(SpinHotKeyScope.SpinAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(SpinHotKeyScope.SpinPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), SpinHotKeyScope.SpinPage);
  useScopedHotkeys(`esc`, () => onClose(), SpinHotKeyScope.SpinAddSheet);

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add spin campaign
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-3xl p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Sheet.Header>
          <Sheet.Title>Add spin campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <SpinTabs onOpenChange={setOpen} form={form} />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
