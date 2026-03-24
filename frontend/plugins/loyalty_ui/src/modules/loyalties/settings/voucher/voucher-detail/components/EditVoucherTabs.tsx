import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, Tabs, useToast } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { useVoucherEdit } from '../hooks/useVoucherEdit';
import { useVoucherDetailWithQuery } from '../hooks/useVoucherDetailWithQuery';

import {
  VoucherTab,
  getNextVoucherTab,
  isLastVoucherTab,
} from '../../utils/getVoucherTabs';

import { AddVoucherCampaignForm } from '../../add-voucher-campaign/components/AddVoucherCampaignForm';
import { AddVoucherLotteryForm } from '../../add-voucher-campaign/components/AddVoucherLotteryForm';
import { AddVoucherProductBonusForm } from '../../add-voucher-campaign/components/AddVoucherProductBonusForm';
import { AddVoucherRestrictionForm } from '../../add-voucher-campaign/components/AddVoucherRestrictionForm';
import { AddVoucherSpinForm } from '../../add-voucher-campaign/components/AddVoucherSpinForm';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<VoucherFormValues>;
};

export const EditVoucherTabs = ({ onOpenChange, form }: Props) => {
  const [activeTab, setActiveTab] = useState<VoucherTab>('campaign');

  const selectedType = form.watch('type');

  const { voucherEdit, loading } = useVoucherEdit();
  const { voucherDetail } = useVoucherDetailWithQuery();
  const { toast } = useToast();

  const showProductBonusTab = selectedType === 'bonus';
  const showLotteryTab = selectedType === 'lottery';
  const showSpinTab = selectedType === 'spin';

  const handleNext = () => {
    const next = getNextVoucherTab({
      activeTab,
      showProductBonusTab,
      showLotteryTab,
      showSpinTab,
    });

    if (next) setActiveTab(next);
  };

  const isLast = isLastVoucherTab({
    activeTab,
    showProductBonusTab,
    showLotteryTab,
    showSpinTab,
  });

  const toNumber = (value: any) =>
    value === '' || value == null ? undefined : Number(value);

  const formatDate = (date: any) =>
    date instanceof Date ? date.toISOString() : date;

  const handleSubmit = () => {
    if (!voucherDetail?._id) return;

    const data = form.getValues();

    const variables = {
      _id: voucherDetail._id,

      title: data.title || '',
      description: data.description || '',
      status: data.status || 'active',

      voucherType: data.type,
      kind: data.kind,

      value: toNumber(data.value),
      buyScore: toNumber(data.buyScore),

      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),

      restrictions: {
        minimumSpend: toNumber(data.minimumSpend),
        maximumSpend: toNumber(data.maximumSpend),
        categoryIds: data.categoryIds || [],
        excludeCategoryIds: data.excludeCategoryIds || [],
        productIds: data.productIds || [],
        excludeProductIds: data.excludeProductIds || [],
        tag: data.tag || '',
        orExcludeTag: data.orExcludeTag || '',
      },

      ...(data.bonusProduct && {
        bonusProductId: data.bonusProduct,
      }),

      ...(data.bonusCount && {
        bonusCount: toNumber(data.bonusCount),
      }),

      ...(data.spinCampaignId && {
        spinCampaignId: data.spinCampaignId,
      }),

      ...(data.spinCount && {
        spinCount: toNumber(data.spinCount),
      }),

      ...(data.lotteryCount && {
        lotteryCount: toNumber(data.lotteryCount),
      }),
    };

    voucherEdit({
      variables,
      onError: (e: ApolloError) =>
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        }),
      onCompleted: () => onOpenChange(false),
    });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as VoucherTab)}
      className="flex flex-col h-full"
    >
      <Tabs.List className="flex justify-center">
        <Tabs.Trigger asChild value="campaign">
          <Button variant="outline">Campaign</Button>
        </Tabs.Trigger>

        <Tabs.Trigger asChild value="restriction">
          <Button variant="outline">Restriction</Button>
        </Tabs.Trigger>

        {showProductBonusTab && (
          <Tabs.Trigger asChild value="productBonus">
            <Button variant="outline">Product Bonus</Button>
          </Tabs.Trigger>
        )}

        {showLotteryTab && (
          <Tabs.Trigger asChild value="lottery">
            <Button variant="outline">Lottery Campaign</Button>
          </Tabs.Trigger>
        )}

        {showSpinTab && (
          <Tabs.Trigger asChild value="spin">
            <Button variant="outline">Spin Campaign</Button>
          </Tabs.Trigger>
        )}
      </Tabs.List>

      <Tabs.Content value="campaign">
        <Form {...form}>
          <AddVoucherCampaignForm onOpenChange={onOpenChange} form={form} />
        </Form>
      </Tabs.Content>

      <Tabs.Content value="restriction">
        <Form {...form}>
          <AddVoucherRestrictionForm onOpenChange={onOpenChange} />
        </Form>
      </Tabs.Content>

      {showProductBonusTab && (
        <Tabs.Content value="productBonus">
          <Form {...form}>
            <AddVoucherProductBonusForm form={form} />
          </Form>
        </Tabs.Content>
      )}

      {showLotteryTab && (
        <Tabs.Content value="lottery">
          <Form {...form}>
            <AddVoucherLotteryForm form={form} />
          </Form>
        </Tabs.Content>
      )}

      {showSpinTab && (
        <Tabs.Content value="spin">
          <Form {...form}>
            <AddVoucherSpinForm form={form} />
          </Form>
        </Tabs.Content>
      )}

      <Sheet.Footer className="flex justify-end gap-2 p-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>

        {isLast ? (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </Sheet.Footer>
    </Tabs>
  );
};
