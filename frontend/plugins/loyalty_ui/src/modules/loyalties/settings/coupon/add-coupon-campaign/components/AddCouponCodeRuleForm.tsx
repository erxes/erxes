import { useState } from 'react';
import { ScrollArea, Sheet, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CouponFormValues } from '../../constants/couponFormSchema';
import { CouponDefaultCodeRuleField } from './coupon-code-rule-field/CouponDefaultCodeRuleField';
import { CouponStaticCodeRuleField } from './coupon-code-rule-field/CouponStaticCodeRuleField';
import { UseFormReturn } from 'react-hook-form';

export function AddCouponCodeRuleForm({
  form,
}: Readonly<{
  form: UseFormReturn<CouponFormValues>;
}>) {
  const { t } = useTranslation('loyalty');
  const [activeSubTab, setActiveSubTab] = useState('default');

  return (
    <Sheet.Content className="flex-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-5 flex flex-col gap-4">
          <Tabs
            value={activeSubTab}
            onValueChange={setActiveSubTab}
            className="w-full"
          >
            <Tabs.List className="grid w-full grid-cols-2 border-0">
              <Tabs.Trigger className="" value="default">
                {t('default')}
              </Tabs.Trigger>
              <Tabs.Trigger value="static">{t('static')}</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="default" className="mt-4">
              <CouponDefaultCodeRuleField form={form} />
            </Tabs.Content>
            <Tabs.Content value="static" className="mt-4">
              <CouponStaticCodeRuleField form={form} />
            </Tabs.Content>
          </Tabs>
        </div>
      </ScrollArea>
    </Sheet.Content>
  );
}
