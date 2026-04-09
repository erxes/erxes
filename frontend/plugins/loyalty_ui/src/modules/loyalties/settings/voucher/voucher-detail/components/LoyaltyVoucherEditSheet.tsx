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
import { VoucherHotKeyScope } from '../../types/VoucherHotKeyScope';
import { EditVoucherTabs } from './EditVoucherTabs';
import {
  voucherFormSchema,
  VoucherFormValues,
} from '../../constants/voucherFormSchema';
import { useVoucherDetailWithQuery } from '../hooks/useVoucherDetailWithQuery';

type Props = {
  voucherId?: string;
};

export const LoyaltyVoucherEditSheet = ({ voucherId }: Props) => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { voucherDetail } = useVoucherDetailWithQuery();
  const [editVoucherId, setEditVoucherId] = useQueryState('editVoucherId');

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

  useEffect(() => {
    if (voucherDetail && voucherDetail._id === editVoucherId) {
      const restrictions = voucherDetail.restrictions || {};

      form.reset({
        title: voucherDetail.title || '',
        buyScore: voucherDetail.buyScore?.toString() || '0',
        type: voucherDetail.voucherType || 'product discount',
        description: voucherDetail.description || '',
        status: voucherDetail.status || 'active',
        value: voucherDetail.value || 0,
        startDate: voucherDetail.startDate
          ? new Date(voucherDetail.startDate)
          : undefined,
        endDate: voucherDetail.endDate
          ? new Date(voucherDetail.endDate)
          : undefined,
        kind: voucherDetail.kind || '',
        minimumSpend: restrictions.minimumSpend ?? undefined,
        maximumSpend: restrictions.maximumSpend ?? undefined,
        categoryIds: restrictions.categoryIds ?? [],
        excludeCategoryIds: restrictions.excludeCategoryIds ?? [],
        productIds: restrictions.productIds ?? [],
        excludeProductIds: restrictions.excludeProductIds ?? [],
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
        bonusProduct: voucherDetail.bonusProductId ?? undefined,
        bonusCount: voucherDetail.bonusCount ?? undefined,
        spinCount: voucherDetail.spinCount ?? undefined,
        spinCampaignId: voucherDetail.spinCampaignId ?? undefined,
        lotteryCount: voucherDetail.lotteryCount ?? undefined,
      });
    }
  }, [voucherDetail, editVoucherId, form]);

  useEffect(() => {
    if (editVoucherId) {
      setOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(
        VoucherHotKeyScope.VoucherEditSheet,
      );
    } else {
      setOpen(false);
      setHotkeyScope(VoucherHotKeyScope.VouchersPage);
    }
  }, [editVoucherId, setHotkeyScope, setHotkeyScopeAndMemorizePreviousScope]);

  const onClose = () => {
    setEditVoucherId(null);
  };

  useScopedHotkeys(
    `e`,
    () => {
      if (voucherDetail && !editVoucherId) {
        setEditVoucherId(voucherDetail._id);
      }
    },
    VoucherHotKeyScope.VouchersPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), VoucherHotKeyScope.VoucherEditSheet);

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={open} modal>
      {voucherId && (
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
          <Sheet.Title>Edit voucher campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <EditVoucherTabs
            onOpenChange={(open) => !open && onClose()}
            form={form}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
