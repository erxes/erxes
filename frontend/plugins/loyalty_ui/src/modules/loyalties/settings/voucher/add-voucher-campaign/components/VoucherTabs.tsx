import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, Tabs, useToast } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { useAddVoucher } from '../../hooks/useAddVoucher';
import { AddVoucherCampaignForm } from './AddVoucherCampaignForm';
import { AddVoucherLotteryForm } from './AddVoucherLotteryForm';
import { AddVoucherProductBonusForm } from './AddVoucherProductBonusForm';
import { AddVoucherRestrictionForm } from './AddVoucherRestrictionForm';
import { AddVoucherSpinForm } from './AddVoucherSpinForm';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<VoucherFormValues>;
};

export const VoucherTabs = ({ onOpenChange, form }: Props) => {
  const [activeTab, setActiveTab] = useState('campaign');
  const selectedType = form.watch('type');

  const { voucherAdd, loading } = useAddVoucher();
  const { toast } = useToast();

  const showProductBonusTab = selectedType === 'bonus';
  const showLotteryTab = selectedType === 'lottery';
  const showSpinTab = selectedType === 'spin';

  // ---------- helpers ----------

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

  const buildTabOrder = () => {
    const tabs = ['campaign', 'restriction'];

    if (showProductBonusTab) tabs.push('productBonus');
    if (showLotteryTab) tabs.push('lottery');
    if (showSpinTab) tabs.push('spin');

    return tabs;
  };

  const getNextTab = () => {
    const tabs = buildTabOrder();
    const currentIndex = tabs.indexOf(activeTab);

    return currentIndex < tabs.length - 1
      ? tabs[currentIndex + 1]
      : null;
  };

  const isLastTab = () => {
    const tabs = buildTabOrder();
    return activeTab === tabs[tabs.length - 1];
  };

  // ---------- handlers ----------

  const handleNext = () => {
    const next = getNextTab();
    if (next) setActiveTab(next);
  };

  const handleSubmit = async () => {
    const data = form.getValues();

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
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  // ---------- footer ----------

  const renderFooter = () => (
    <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted border-t">
      <Button
        type="button"
        variant="ghost"
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>

      {isLastTab() ? (
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleNext}
        >
          Next
        </Button>
      )}
    </Sheet.Footer>
  );

  // ---------- render ----------

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
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
          {renderFooter()}
        </Form>
      </Tabs.Content>

      <Tabs.Content value="restriction">
        <Form {...form}>
          <AddVoucherRestrictionForm
            onOpenChange={onOpenChange}
          />
          {renderFooter()}
        </Form>
      </Tabs.Content>

      {showProductBonusTab && (
        <Tabs.Content value="productBonus">
          <Form {...form}>
            <AddVoucherProductBonusForm form={form} />
            {renderFooter()}
          </Form>
        </Tabs.Content>
      )}

      {showLotteryTab && (
        <Tabs.Content value="lottery">
          <Form {...form}>
            <AddVoucherLotteryForm form={form} />
            {renderFooter()}
          </Form>
        </Tabs.Content>
      )}

      {showSpinTab && (
        <Tabs.Content value="spin">
          <Form {...form}>
            <AddVoucherSpinForm form={form} />
            {renderFooter()}
          </Form>
        </Tabs.Content>
      )}
    </Tabs>
  );
};
