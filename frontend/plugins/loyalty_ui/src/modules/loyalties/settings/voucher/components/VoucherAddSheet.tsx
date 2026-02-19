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
import { VoucherHotKeyScope } from '../types/VoucherHotKeyScope';
import { VoucherTabs } from '../add-voucher-campaign/components/VoucherTabs';
import {
  voucherFormSchema,
  VoucherFormValues,
} from '../constants/voucherFormSchema';

export const LoyaltyVoucherAddSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: {
      title: '',
      buyScore: '0',
      type: 'Product discount',
      description: '',
      status: 'active',
      count: 0,
    },
  });

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(VoucherHotKeyScope.VoucherAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(VoucherHotKeyScope.VouchersPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), VoucherHotKeyScope.VouchersPage);
  useScopedHotkeys(`esc`, () => onClose(), VoucherHotKeyScope.VoucherAddSheet);

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add voucher campaign
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
          <Sheet.Title>Add voucher campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <VoucherTabs onOpenChange={setOpen} form={form} />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
