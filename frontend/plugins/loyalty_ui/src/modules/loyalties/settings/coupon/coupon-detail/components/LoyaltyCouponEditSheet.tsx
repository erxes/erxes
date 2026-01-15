import { IconEdit } from '@tabler/icons-react';

import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useQueryState,
} from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CouponHotKeyScope } from '../../types/CouponHotKeyScope';

import { useCouponDetailWithQuery } from '../hooks/useCouponDetailWithQuery';
import {
  couponFormSchema,
  CouponFormValues,
} from '../../constants/couponFormSchema';
import { EditCouponTabs } from './EditCouponTabs';

type Props = {
  couponId?: string;
};

export const LoyaltyCouponEditSheet = ({ couponId }: Props) => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { couponDetail } = useCouponDetailWithQuery();
  const [editCouponId, setEditCouponId] = useQueryState('editCouponId');

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

  useEffect(() => {
    if (couponDetail && couponDetail._id === editCouponId) {
      const conditions = couponDetail.conditions || {};

      form.reset({
        title: couponDetail.name || '',
        buyScore: conditions.buyScore?.toString() || '0',
        description: couponDetail.description || '',
        status: couponDetail.status || 'active',
        count: conditions.count || 0,
        startDate: couponDetail.startDate
          ? new Date(couponDetail.startDate)
          : undefined,
        endDate: couponDetail.endDate
          ? new Date(couponDetail.endDate)
          : undefined,
        kind: couponDetail.kind || '',
        minimumSpend: conditions.restrictions?.minimumSpend,
        maximumSpend: conditions.restrictions?.maximumSpend,
        categoryIds: conditions.restrictions?.categoryIds,
        excludeCategoryIds: conditions.restrictions?.excludeCategoryIds,
        productIds: conditions.restrictions?.productIds,
        excludeProductIds: conditions.restrictions?.excludeProductIds,
        tag: conditions.restrictions?.tag,
        orExcludeTag: conditions.restrictions?.orExcludeTag,
        codeLength: conditions.codeRule?.codeLength,
        prefixUppercase: conditions.codeRule?.prefixUppercase,
        pattern: conditions.codeRule?.pattern,
        redemptionLimitPerUser: conditions.codeRule?.redemptionLimitPerUser,
        characterSet: conditions.codeRule?.characterSet,
        numberOfCodes: conditions.codeRule?.numberOfCodes,
        postfixUppercase: conditions.codeRule?.postfixUppercase,
        usageLimit: conditions.codeRule?.usageLimit,
      });
    }
  }, [couponDetail, editCouponId, form]);

  useEffect(() => {
    if (editCouponId) {
      setOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(CouponHotKeyScope.CouponEditSheet);
    } else {
      setOpen(false);
      setHotkeyScope(CouponHotKeyScope.CouponsPage);
    }
  }, [editCouponId, setHotkeyScope, setHotkeyScopeAndMemorizePreviousScope]);

  const onClose = () => {
    setEditCouponId(null);
  };

  useScopedHotkeys(
    `e`,
    () => {
      if (couponDetail && !editCouponId) {
        setEditCouponId(couponDetail._id);
      }
    },
    CouponHotKeyScope.CouponsPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), CouponHotKeyScope.CouponEditSheet);

  return (
    <Sheet
      onOpenChange={(open: boolean) => (!open ? onClose() : null)}
      open={open}
      modal
    >
      {couponId && (
        <Sheet.Trigger asChild>
          <Button variant="ghost" size="sm">
            <IconEdit className="h-4 w-4" />
            Edit
            <Kbd>E</Kbd>
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View
        className="sm:max-w-3xl p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Sheet.Header>
          <Sheet.Title>Edit coupon campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <EditCouponTabs
            onOpenChange={(open) => !open && onClose()}
            form={form}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
