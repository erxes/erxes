import { ScrollArea, Sheet } from 'erxes-ui';
import { CouponFormValues } from '../../constants/couponFormSchema';
import { CouponAddCampaignCoreFields } from './coupon-campaign-field/CouponAddCampaignCoreFields';
import { CouponAddCampaignMoreFields } from './coupon-campaign-field/CouponAddCampaignMoreFields';
import { UseFormReturn } from 'react-hook-form';

export function AddCouponCampaignForm({
  form: couponForm,
}: Readonly<{
  form: UseFormReturn<CouponFormValues>;
}>) {
  return (
    <Sheet.Content className="flex-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-5 flex flex-col gap-2">
          <CouponAddCampaignCoreFields form={couponForm} />
          <CouponAddCampaignMoreFields form={couponForm} />
        </div>
      </ScrollArea>
    </Sheet.Content>
  );
}
