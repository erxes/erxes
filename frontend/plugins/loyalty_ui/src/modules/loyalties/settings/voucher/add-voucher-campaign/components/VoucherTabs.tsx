import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, Tabs, useToast } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { useAddVoucher } from '../../hooks/useAddVoucher';
import {
  VoucherTab,
  getNextVoucherTab,
  isLastVoucherTab,
} from '../../utils/getVoucherTabs';
import { AddVoucherCampaignForm } from './AddVoucherCampaignForm';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<VoucherFormValues>;
};

export const VoucherTabs = ({ onOpenChange, form }: Props) => {
  const [activeTab, setActiveTab] =
    useState<VoucherTab>('campaign');

  const selectedType = form.watch('type');
  const { voucherAdd, loading } = useAddVoucher();
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

  const handleSubmit = async () => {
    const data = form.getValues();

    const toNumber = (value: any) =>
      value === '' || value == null ? undefined : Number(value);

    const formatDate = (date: any) =>
      date instanceof Date ? date.toISOString() : date;

    const variables = {
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

    voucherAdd({
      variables,
      onError: (e: ApolloError) =>
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        }),
      onCompleted: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };


  const isLast = isLastVoucherTab({
    activeTab,
    showProductBonusTab,
    showLotteryTab,
    showSpinTab,
  });

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        setActiveTab(value as VoucherTab)
      }
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
          <AddVoucherCampaignForm
            onOpenChange={onOpenChange}
            form={form}
          />
        </Form>
      </Tabs.Content>

      <Sheet.Footer className="flex justify-end gap-2 p-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>

        {isLast ? (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </Sheet.Footer>
    </Tabs>
  );
};
