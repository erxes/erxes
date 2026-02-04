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

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<VoucherFormValues>;
};

export const EditVoucherTabs = ({ onOpenChange, form }: Props) => {
  const [activeTab, setActiveTab] = useState('campaign');
  const selectedType = form.watch('type');
  const { voucherEdit, loading: editLoading } = useVoucherEdit();
  const { voucherDetail } = useVoucherDetailWithQuery();
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
    if (!voucherDetail?._id) return;

    const data = form.getValues();

    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
    };

    const variables: any = {
      _id: voucherDetail._id,
      title: data.title || '',
      kind: data.kind,
      value: data.value,
      description: data.description || '',
      status: data.status || 'active',
      type: data.type || 'Product Discount',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),
      restrictions: {
        minimumSpend: data.minimumSpend,
        maximumSpend: data.maximumSpend,
        categoryIds: data.categoryIds,
        excludeCategoryIds: data.excludeCategoryIds,
        productIds: data.productIds,
        excludeProductIds: data.excludeProductIds,
        tag: data.tag,
        orExcludeTag: data.orExcludeTag,
      },
      buyScore: data.buyScore,
      ...(data.bonusProduct && { bonusProductId: data.bonusProduct }),
      ...(data.bonusCount && { bonusCount: Number(data.bonusCount) }),
      ...(data.spinCount && { spinCount: data.spinCount }),
      ...(data.spinCampaignId && { spinCampaignId: data.spinCampaignId }),
      ...(data.lottery && { lottery: data.lottery }),
      ...(data.lotteryCount && { lotteryCount: data.lotteryCount }),
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
          {editLoading ? 'Updating...' : 'Update'}
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
