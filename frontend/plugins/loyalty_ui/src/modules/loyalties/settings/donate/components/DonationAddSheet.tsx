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
import { DonationHotKeyScope } from '../types/DonationHotKeyScope';
import { DonationTabs } from '../add-donation-campaign/components/DonationTabs';
import {
  donationFormSchema,
  DonationFormValues,
} from '../constants/donationFormSchema';

export const LoyaltyDonationAddSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      title: '',
      status: 'active',
      maxScore: 0,
      conditions: [
        {
          voucherCampaignId: '',
          minScore: 0,
        },
      ],
    },
  });

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      DonationHotKeyScope.DonationAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(DonationHotKeyScope.DonationPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), DonationHotKeyScope.DonationPage);
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    DonationHotKeyScope.DonationAddSheet,
  );

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add donation campaign
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-4xl p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Sheet.Header>
          <Sheet.Title>Add donation campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <DonationTabs onOpenChange={setOpen} form={form} />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
