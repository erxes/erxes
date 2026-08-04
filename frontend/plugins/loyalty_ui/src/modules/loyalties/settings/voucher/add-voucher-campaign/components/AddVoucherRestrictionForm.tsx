import { ScrollArea } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { VoucherAddRestrictionCoreField } from './voucher-restriction-field/VoucherAddRestrictionCoreField';
import { VoucherAddRestrictionMoreFields } from './voucher-restriction-field/VoucherAddRestrictionMoreFields';

export function AddVoucherRestrictionForm({
  form,
}: Readonly<{
  form: UseFormReturn<VoucherFormValues>;
}>) {
  return (
    <ScrollArea className="h-full">
      <div className="p-5 flex flex-col gap-4">
        <VoucherAddRestrictionCoreField form={form} />
        <VoucherAddRestrictionMoreFields form={form} />
      </div>
    </ScrollArea>
  );
}
