import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, Tabs, useToast } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AddCouponCampaignForm } from '../../add-coupon-campaign/components/AddCouponCampaignForm';
import { AddCouponCodeRuleForm } from '../../add-coupon-campaign/components/AddCouponCodeRuleForm';
import { AddCouponRestrictionForm } from '../../add-coupon-campaign/components/AddCouponRestrictionForm';
import { CouponFormValues } from '../../constants/couponFormSchema';
import { useCouponDetailWithQuery } from '../hooks/useCouponDetailWithQuery';
import { useCouponEdit } from '../hooks/useCouponEdit';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CouponFormValues>;
};

export const EditCouponTabs = ({ onOpenChange, form }: Props) => {
  const { t } = useTranslation('loyalty');
  const [activeTab, setActiveTab] = useState('campaign');

  const { couponDetail } = useCouponDetailWithQuery();
  const { couponEdit, loading: editLoading } = useCouponEdit(
    couponDetail?._id,
    () => {
      onOpenChange(false);
    },
  );
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
      _id: couponDetail._id,
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'active',
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
      value: data.count,
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

    couponEdit({
      variables,
      onError: (e: ApolloError) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
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
        {t('cancel')}
      </Button>
      {isLastTab() ? (
        <Button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={editLoading}
        >
          {editLoading ? t('updating') : t('update')}
        </Button>
      ) : (
        <Button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleNext}
        >
          {t('next')}
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
            {t('campaign')}
          </Button>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="restriction">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            {t('restriction')}
          </Button>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="codeRule">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            {t('code-rule')}
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
