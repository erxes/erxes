import { useState } from 'react';
import { Button, Tabs, Form, Sheet } from 'erxes-ui';
import { AddCouponCampaignForm } from './AddCouponCampaignForm';
import { AddCouponRestrictionForm } from './AddCouponRestrictionForm';
import { UseFormReturn } from 'react-hook-form';
import { CouponFormValues } from '../../constants/couponFormSchema';
import { useAddCoupon } from '../../hooks/useAddCoupon';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { AddCouponCodeRuleForm } from './AddCouponCodeRuleForm';

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
      name: data.title || '',
      kind: 'coupon',
      description: data.description || '',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),

      conditions: {
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
        count: data.count,
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
      },
    };

    if (data?.kind) {
      variables.conditions[data.kind] = data.count;
    }

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
              <AddCouponCampaignForm onOpenChange={onOpenChange} form={form} />
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
              <AddCouponRestrictionForm
                onOpenChange={onOpenChange}
                form={form}
              />
            </div>
            {renderFooter()}
          </div>
        </Form>
      </Tabs.Content>
      <Tabs.Content value="codeRule" className="h-full py-4 px-5 overflow-auto">
        <Form {...form}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-auto overflow-hidden">
              <AddCouponCodeRuleForm onOpenChange={onOpenChange} form={form} />
            </div>
            {renderFooter()}
          </div>
        </Form>
      </Tabs.Content>
    </Tabs>
  );
};
