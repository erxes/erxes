import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, Tabs, useToast } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AddVoucherCampaignForm } from '../../add-voucher-campaign/components/AddVoucherCampaignForm';
import { AddVoucherLotteryForm } from '../../add-voucher-campaign/components/AddVoucherLotteryForm';
import { AddVoucherProductBonusForm } from '../../add-voucher-campaign/components/AddVoucherProductBonusForm';
import { AddVoucherRestrictionForm } from '../../add-voucher-campaign/components/AddVoucherRestrictionForm';
import { AddVoucherSpinForm } from '../../add-voucher-campaign/components/AddVoucherSpinForm';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { useVoucherDetailWithQuery } from '../hooks/useVoucherDetailWithQuery';
import { useVoucherEdit } from '../hooks/useVoucherEdit';
import {
  getNextVoucherTab,
  isLastVoucherTab,
  getVoucherTabOrder,
  VoucherTab,
} from '../../utils/getVoucherTabs';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<VoucherFormValues>;
};

export const EditVoucherTabs = ({ onOpenChange, form }: Props) => {
  const [activeTab, setActiveTab] = useState<VoucherTab>('campaign');
  const selectedType = form.watch('type');

  const { voucherEdit, loading: editLoading } = useVoucherEdit();
  const { voucherDetail } = useVoucherDetailWithQuery();
  const { toast } = useToast();

  const tabOrder = getVoucherTabOrder(selectedType);

  const toNumber = (value: any): number | undefined => {
    if (value === '' || value === undefined || value === null) {
      return undefined;
    }
    return Number(value);
  };

  const formatDate = (
    date: string | Date | undefined,
  ): string | undefined => {
    if (!date) return undefined;
    if (date instanceof Date) return date.toISOString();
    return date;
  };

  const handleNext = () => {
    const nextTab = getNextVoucherTab(activeTab, selectedType);
    if (nextTab) setActiveTab(nextTab);
  };

  const handleSubmit = async () => {
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
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        onOpenChange(false);
      },
    });
  };

  const renderFooter = () => (
    <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted border-t">
      <Button
        type="button"
        variant="ghost"
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>

      {isLastVoucherTab(activeTab, selectedType) ? (
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={editLoading}
        >
          {editLoading ? 'Updating...' : 'Update'}
        </Button>
      ) : (
        <Button type="button" onClick={handleNext}>
          Next
        </Button>
      )}
    </Sheet.Footer>
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as VoucherTab)}
      className="flex flex-col h-full shadow-none"
    >
      <Tabs.List className="flex justify-center">
        {tabOrder.includes('campaign') && (
          <Tabs.Trigger asChild value="campaign">
            <Button variant="outline">Campaign</Button>
          </Tabs.Trigger>
        )}

        {tabOrder.includes('restriction') && (
          <Tabs.Trigger asChild value="restriction">
            <Button variant="outline">Restriction</Button>
          </Tabs.Trigger>
        )}

        {tabOrder.includes('productBonus') && (
          <Tabs.Trigger asChild value="productBonus">
            <Button variant="outline">Product Bonus</Button>
          </Tabs.Trigger>
        )}

        {tabOrder.includes('lottery') && (
          <Tabs.Trigger asChild value="lottery">
            <Button variant="outline">Lottery Campaign</Button>
          </Tabs.Trigger>
        )}

        {tabOrder.includes('spin') && (
          <Tabs.Trigger asChild value="spin">
            <Button variant="outline">Spin Campaign</Button>
          </Tabs.Trigger>
        )}
      </Tabs.List>

      <Tabs.Content value="campaign" className="h-full py-4 px-5 overflow-auto">
        <Form {...form}>
          <AddVoucherCampaignForm onOpenChange={onOpenChange} form={form} />
          {renderFooter()}
        </Form>
      </Tabs.Content>

      <Tabs.Content
        value="restriction"
        className="h-full py-4 px-5 overflow-auto"
      >
        <Form {...form}>
          <AddVoucherRestrictionForm onOpenChange={onOpenChange} />
          {renderFooter()}
        </Form>
      </Tabs.Content>

      {tabOrder.includes('productBonus') && (
        <Tabs.Content
          value="productBonus"
          className="h-full py-4 px-5 overflow-auto"
        >
          <Form {...form}>
            <AddVoucherProductBonusForm form={form} />
            {renderFooter()}
          </Form>
        </Tabs.Content>
      )}

      {tabOrder.includes('lottery') && (
        <Tabs.Content
          value="lottery"
          className="h-full py-4 px-5 overflow-auto"
        >
          <Form {...form}>
            <AddVoucherLotteryForm form={form} />
            {renderFooter()}
          </Form>
        </Tabs.Content>
      )}

      {tabOrder.includes('spin') && (
        <Tabs.Content value="spin" className="h-full py-4 px-5 overflow-auto">
          <Form {...form}>
            <AddVoucherSpinForm form={form} />
            {renderFooter()}
          </Form>
        </Tabs.Content>
      )}
    </Tabs>
  );
};
