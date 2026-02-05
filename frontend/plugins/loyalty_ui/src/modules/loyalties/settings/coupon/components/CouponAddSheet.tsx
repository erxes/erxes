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
import { CouponHotKeyScope } from '../types/CouponHotKeyScope';
import { CouponTabs } from '../add-coupon-campaign/components/CouponTabs';
import {
  couponFormSchema,
  CouponFormValues,
} from '../constants/couponFormSchema';

export const LoyaltyCouponAddSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      title: '',
      buyScore: '0',
      description: '',
      status: 'active',
      count: 0,
      codeLength: 0,
      prefixUppercase: '',
      pattern: '',
      redemptionLimitPerUser: 0,
      characterSet: '',
      numberOfCodes: 0,
      postfixUppercase: '',
      usageLimit: 0,
    },
  });

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(CouponHotKeyScope.CouponAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(CouponHotKeyScope.CouponsPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), CouponHotKeyScope.CouponsPage);
  useScopedHotkeys(`esc`, () => onClose(), CouponHotKeyScope.CouponAddSheet);

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add coupon campaign
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
          <Sheet.Title>Add coupon campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <CouponTabs onOpenChange={setOpen} form={form} />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
