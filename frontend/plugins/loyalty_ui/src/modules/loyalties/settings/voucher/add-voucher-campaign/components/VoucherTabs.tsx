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
  const { voucherAdd, loading: editLoading } = useAddVoucher();
  const { toast } = useToast();

  const showProductBonusTab = selectedType === 'bonus';
  const showLotteryTab = selectedType === 'lottery';
  const showSpinTab = selectedType === 'spin';

  const getNextTab = (currentTab: string) => {
    const tabOrder = ['campaign', 'restriction'];
    if (showProductBonusTab) tabOrder.push('productBonus');
    if (showLotteryTab) tabOrder.push('lottery');
    if (showSpinTab) tabOrder.push('spin');

    const currentIndex = tabOrder.indexOf(currentTab);
    return currentIndex < tabOrder.length - 1
      ? tabOrder[currentIndex + 1]
      : null;
  };

  const isLastTab = () => {
    const tabOrder = ['campaign', 'restriction'];
    if (showProductBonusTab) tabOrder.push('productBonus');
    if (showLotteryTab) tabOrder.push('lottery');
    if (showSpinTab) tabOrder.push('spin');

    return activeTab === tabOrder[tabOrder.length - 1];
  };

  const handleNext = () => {
    const nextTab = getNextTab(activeTab);
    if (nextTab) {
      setActiveTab(nextTab);
    }
  };

  const handleSubmit = async () => {
    const data = form.getValues();

    const toNumber = (value: any) => {
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

    const variables = {
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'active',
      voucherType: data.type,

      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),

      kind: data.kind,
      value: toNumber(data.value),
      buyScore: toNumber(data.buyScore),

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


  const renderFooter = () => (
    <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted border-t">
      <Button
        type="button"
        variant="ghost"
        className="bg-background hover:bg-background/90"
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>
      {isLastTab() ? (
        <Button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={editLoading}
        >
          {editLoading ? 'Saving...' : 'Save'}
        </Button>
      ) : (
        <Button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleNext}
        >
          Next
        </Button>
      )}
    </Sheet.Footer>
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col h-full shadow-none"
    >
      <Tabs.List className="flex justify-center">
        <Tabs.Trigger asChild value="campaign">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            Campaign
          </Button>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="restriction">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            Restriction
          </Button>
        </Tabs.Trigger>
        {showProductBonusTab && (
          <Tabs.Trigger asChild value="productBonus">
            <Button
              variant={'outline'}
              className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
            >
              Product Bonus
            </Button>
          </Tabs.Trigger>
        )}
        {showLotteryTab && (
          <Tabs.Trigger asChild value="lottery">
            <Button
              variant={'outline'}
              className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
            >
              Lottery Campaign
            </Button>
          </Tabs.Trigger>
        )}
        {showSpinTab && (
          <Tabs.Trigger asChild value="spin">
            <Button
              variant={'outline'}
              className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
            >
              Spin Campaign
            </Button>
          </Tabs.Trigger>
        )}
      </Tabs.List>
      <Tabs.Content value="campaign" className="h-full py-4 px-5 overflow-auto">
        <Form {...form}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-auto overflow-hidden">
              <AddVoucherCampaignForm onOpenChange={onOpenChange} form={form} />
            </div>
            {renderFooter()}
          </div>
        </Form>
      </Tabs.Content>
      <Tabs.Content
        value="restriction"
        className="h-full py-4 px-5 overflow-auto"
      >
        <Form {...form}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-auto overflow-hidden">
              <AddVoucherRestrictionForm onOpenChange={onOpenChange} />
            </div>
            {renderFooter()}
          </div>
        </Form>
      </Tabs.Content>
      {showProductBonusTab && (
        <Tabs.Content
          value="productBonus"
          className="h-full py-4 px-5 overflow-auto"
        >
          <Form {...form}>
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-auto overflow-hidden">
                <AddVoucherProductBonusForm form={form} />
              </div>
              {renderFooter()}
            </div>
          </Form>
        </Tabs.Content>
      )}
      {showLotteryTab && (
        <Tabs.Content
          value="lottery"
          className="h-full py-4 px-5 overflow-auto"
        >
          <Form {...form}>
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-auto overflow-hidden">
                <AddVoucherLotteryForm form={form} />
              </div>
              {renderFooter()}
            </div>
          </Form>
        </Tabs.Content>
      )}
      {showSpinTab && (
        <Tabs.Content value="spin" className="h-full py-4 px-5 overflow-auto">
          <Form {...form}>
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-auto overflow-hidden">
                <AddVoucherSpinForm form={form} />
              </div>
              {renderFooter()}
            </div>
          </Form>
        </Tabs.Content>
      )}
    </Tabs>
  );
};
