import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, Tabs, useToast } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('loyalty');
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

  const handleSubmit = form.handleSubmit(
    (data) => {
      if (!voucherDetail?._id) {
        toast({
          title: t('error'),
          description: t('no-voucher-id-provided'),
          variant: 'destructive',
        });
        return;
      }

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
          tag: data.tag || [],
          orExcludeTag: data.orExcludeTag || [],
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
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          }),
        onCompleted: () => {
          toast({
            title: t('success'),
            description: t('voucher-campaign-updated'),
            variant: 'default',
          });
          onOpenChange(false);
        },
      });
    },
    () => {
      setActiveTab('campaign');
      toast({
        title: t('validation-error'),
        description: t('fill-required-fields'),
        variant: 'destructive',
      });
    },
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as VoucherTab)}
      className="flex flex-col h-full"
    >
      <Tabs.List className="flex justify-center">
        <Tabs.Trigger asChild value="campaign">
          <Button variant="outline">{t('campaign')}</Button>
        </Tabs.Trigger>

        <Tabs.Trigger asChild value="restriction">
          <Button variant="outline">{t('restriction')}</Button>
        </Tabs.Trigger>

        {showProductBonusTab && (
          <Tabs.Trigger asChild value="productBonus">
            <Button variant="outline">{t('product-bonus')}</Button>
          </Tabs.Trigger>
        )}

        {showLotteryTab && (
          <Tabs.Trigger asChild value="lottery">
            <Button variant="outline">{t('lottery-campaign')}</Button>
          </Tabs.Trigger>
        )}

        {showSpinTab && (
          <Tabs.Trigger asChild value="spin">
            <Button variant="outline">{t('spin-campaign')}</Button>
          </Tabs.Trigger>
        )}
      </Tabs.List>

      <Tabs.Content value="campaign" className="flex-1 min-h-0">
        <Form {...form}>
          <AddVoucherCampaignForm onOpenChange={onOpenChange} form={form} />
        </Form>
      </Tabs.Content>

      <Tabs.Content
        value="restriction"
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <Form {...form}>
          <AddVoucherRestrictionForm form={form} />
        </Form>
      </Tabs.Content>

      {showProductBonusTab && (
        <Tabs.Content
          value="productBonus"
          className="flex-1 min-h-0 overflow-y-auto"
        >
          <Form {...form}>
            <AddVoucherProductBonusForm form={form} />
          </Form>
        </Tabs.Content>
      )}

      {showLotteryTab && (
        <Tabs.Content
          value="lottery"
          className="flex-1 min-h-0 overflow-y-auto"
        >
          <Form {...form}>
            <AddVoucherLotteryForm form={form} />
          </Form>
        </Tabs.Content>
      )}

      {showSpinTab && (
        <Tabs.Content value="spin" className="flex-1 min-h-0 overflow-y-auto">
          <Form {...form}>
            <AddVoucherSpinForm form={form} />
          </Form>
        </Tabs.Content>
      )}

      <Sheet.Footer className="flex justify-end gap-2 p-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          {t('cancel')}
        </Button>

        {isLast ? (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t('updating') : t('update')}
          </Button>
        ) : (
          <Button onClick={handleNext}>{t('next')}</Button>
        )}
      </Sheet.Footer>
    </Tabs>
  );
};
