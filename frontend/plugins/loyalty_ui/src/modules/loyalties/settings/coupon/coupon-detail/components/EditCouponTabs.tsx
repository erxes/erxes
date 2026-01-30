import { useState } from 'react';
import { Button, Tabs, Form, Sheet, useToast } from 'erxes-ui';
import { AddCouponCampaignForm } from '../../add-coupon-campaign/components/AddCouponCampaignForm';
import { AddCouponRestrictionForm } from '../../add-coupon-campaign/components/AddCouponRestrictionForm';
import { UseFormReturn } from 'react-hook-form';
import { CouponFormValues } from '../../constants/couponFormSchema';
import { useCouponEdit } from '../hooks/useCouponEdit';
import { ApolloError } from '@apollo/client';
import { useCouponDetailWithQuery } from '../hooks/useCouponDetailWithQuery';
import { AddCouponCodeRuleForm } from '../../add-coupon-campaign/components/AddCouponCodeRuleForm';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CouponFormValues>;
};

export const EditCouponTabs = ({ onOpenChange, form }: Props) => {
  const [activeTab, setActiveTab] = useState('campaign');

  const { couponEdit, loading: editLoading } = useCouponEdit();
  const { couponDetail } = useCouponDetailWithQuery();
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
    if (!couponDetail?._id) return;

    const data = form.getValues();

    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
    };

    const variables: any = {
      id: couponDetail._id,
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
        },
      },
    };

    if (data?.kind) {
      variables.conditions[data.kind] = data.count;
    }

    couponEdit({
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
