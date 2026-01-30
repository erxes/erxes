import { ScrollArea, Sheet } from 'erxes-ui';
import { CouponFormValues } from '../../constants/couponFormSchema';
import { CouponAddRestrictionCoreField } from './coupon-restriction-field/CouponAddRestrictionCoreField';
import { CouponAddRestrictionMoreFields } from './coupon-restriction-field/CouponAddRestrictionMoreFields';
import { UseFormReturn } from 'react-hook-form';

export function AddCouponRestrictionForm({
  form,
}: {
  form: UseFormReturn<CouponFormValues>;
}) {
  return (
    <Sheet.Content className="flex-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-5 flex flex-col gap-4">
          <CouponAddRestrictionCoreField form={form} />
          <CouponAddRestrictionMoreFields form={form} />
        </div>
      </ScrollArea>
    </Sheet.Content>
  );
}
