import { ScrollArea, Sheet } from 'erxes-ui';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { VoucherAddCampaignCoreFields } from './voucher-campaign-field/VoucherAddCampaignCoreFields';
import { VoucherAddCampaignMoreFields } from './voucher-campaign-field/VoucherAddCampaignMoreFields';
import { UseFormReturn } from 'react-hook-form';

export function AddVoucherCampaignForm({
  onOpenChange,
  form: voucherForm,
}: Readonly<{
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<VoucherFormValues>;
}>) {
  return (
    <Sheet.Content className="flex-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-5 flex flex-col gap-2">
          <VoucherAddCampaignCoreFields form={voucherForm} />
          <VoucherAddCampaignMoreFields form={voucherForm} />
        </div>
      </ScrollArea>
    </Sheet.Content>
  );
}
