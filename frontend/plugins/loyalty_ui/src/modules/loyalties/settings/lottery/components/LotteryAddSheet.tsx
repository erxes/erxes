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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  lotteryFormSchema,
  LotteryFormValues,
} from '../constants/lotteryFormSchema';
import { LotteryHotKeyScope } from '../types/LotteryHotKeyScope';
import { LotteryTabs } from '../add-lottery-campaign/components/LotteryTabs';

export const LotteryAddSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const form = useForm<LotteryFormValues>({
    resolver: zodResolver(lotteryFormSchema),
    defaultValues: {
      title: '',
      status: 'active',
      conditions: [
        {
          name: '',
          voucherCampaignId: '',
          probablity: 0,
          buyScore: 0,
        },
      ],
    },
  });

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(LotteryHotKeyScope.LotteryAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(LotteryHotKeyScope.LotteryPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), LotteryHotKeyScope.LotteryPage);
  useScopedHotkeys(`esc`, () => onClose(), LotteryHotKeyScope.LotteryAddSheet);

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add lottery campaign
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
          <Sheet.Title>Add lottery campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <LotteryTabs onOpenChange={setOpen} form={form} />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
