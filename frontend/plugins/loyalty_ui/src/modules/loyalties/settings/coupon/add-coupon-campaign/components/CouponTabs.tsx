import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, Tabs, useToast } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CouponFormValues } from '../../constants/couponFormSchema';
import { useAddCoupon } from '../../hooks/useAddCoupon';
import { AddCouponCampaignForm } from './AddCouponCampaignForm';
import { AddCouponCodeRuleForm } from './AddCouponCodeRuleForm';
import { AddCouponRestrictionForm } from './AddCouponRestrictionForm';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CouponFormValues>;
};

export const CouponTabs = ({ onOpenChange, form }: Props) => {
  const [activeTab, setActiveTab] = useState('campaign');
  const { couponAdd, loading: editLoading } = useAddCoupon();
  const { toast } = useToast();

  const getNextTab = (currentTab: string) => {
    const tabOrder = ['campaign', 'restriction', 'codeRule'];

    const currentIndex = tabOrder.indexOf(currentTab);
    return currentIndex < tabOrder.length - 1
      ? tabOrder[currentIndex + 1]
      : null;
  };

  const isLastTab = () => {
    const tabOrder = ['campaign', 'restriction', 'codeRule'];

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

    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
    };

    const variables: any = {
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),

      kind: data.kind,
      value: data.count,
      buyScore: data.buyScore,

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

      codeRule: {
        codeLength: data.codeLength,
        prefixUppercase: data.prefixUppercase,
        pattern: data.pattern,
        redemptionLimitPerUser: data.redemptionLimitPerUser,
        characterSet: data.characterSet,
        numberOfCodes: data.numberOfCodes,
        postfixUppercase: data.postfixUppercase,
        usageLimit: data.usageLimit,
        staticCode: data.staticCode,
      },
    };

    couponAdd({
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
    <Sheet.Footer className="flex justify-end p-2.5 gap-1 ">
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
      className="flex flex-col h-full"
    >
      <Tabs.List className="flex justify-center border-0">
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
        <Tabs.Trigger asChild value="codeRule">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            Code rule
          </Button>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="campaign" className="h-full py-4 px-5 overflow-auto">
        <Form {...form}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-auto overflow-hidden">
              <AddCouponCampaignForm form={form} />
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
              <AddCouponRestrictionForm form={form} />
            </div>
            {renderFooter()}
          </div>
        </Form>
      </Tabs.Content>
      <Tabs.Content value="codeRule" className="h-full py-4 px-5 overflow-auto">
        <Form {...form}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-auto overflow-hidden">
              <AddCouponCodeRuleForm form={form} />
            </div>
            {renderFooter()}
          </div>
        </Form>
      </Tabs.Content>
    </Tabs>
  );
};
