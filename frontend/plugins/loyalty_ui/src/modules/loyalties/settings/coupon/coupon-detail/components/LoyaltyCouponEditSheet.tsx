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
      buyScore: 0,
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
      staticCode: '',
    },
  });

  useEffect(() => {
    if (couponDetail && couponDetail._id === editCouponId) {
      const restrictions = couponDetail.restrictions || {};
      const codeRule = couponDetail.codeRule || {};

      form.reset({
        title: couponDetail.title || '',
        buyScore: couponDetail.buyScore || 0,
        count: couponDetail.value,
        description: couponDetail.description || '',
        status: couponDetail.status || 'active',
        startDate: couponDetail.startDate
          ? new Date(couponDetail.startDate)
          : undefined,
        endDate: couponDetail.endDate
          ? new Date(couponDetail.endDate)
          : undefined,
        kind: couponDetail.kind || '',
        minimumSpend: restrictions.minimumSpend,
        maximumSpend: restrictions.maximumSpend,
        categoryIds: restrictions.categoryIds,
        excludeCategoryIds: restrictions.excludeCategoryIds,
        productIds: restrictions.productIds,
        excludeProductIds: restrictions.excludeProductIds,
        tag: Array.isArray(restrictions.tag)
          ? restrictions.tag
          : restrictions.tag
          ? [restrictions.tag]
          : [],
        orExcludeTag: Array.isArray(restrictions.orExcludeTag)
          ? restrictions.orExcludeTag
          : restrictions.orExcludeTag
          ? [restrictions.orExcludeTag]
          : [],
        codeLength: codeRule.codeLength,
        prefixUppercase: codeRule.prefixUppercase,
        pattern: codeRule.pattern,
        redemptionLimitPerUser: codeRule.redemptionLimitPerUser,
        characterSet: codeRule.characterSet,
        numberOfCodes: codeRule.numberOfCodes,
        postfixUppercase: codeRule.postfixUppercase,
        usageLimit: codeRule.usageLimit,
        staticCode: codeRule.staticCode ?? '',
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
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
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
            onOpenChange={(open) => {
              if (!open) onClose();
            }}
            form={form}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
