import { ScrollArea, Sheet } from 'erxes-ui';
import { SpinFormValues } from '../../constants/spinFormSchema';
import { SpinAddCampaignCoreFields } from './spin-field/SpinAddCampaignCoreFields';
import { SpinAddCampaignMoreFields } from './spin-field/SpinAddCampaignMoreFields';
import { UseFormReturn } from 'react-hook-form';

export function AddSpinCampaignForm({
  onOpenChange,
  form: spinForm,
}: {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<SpinFormValues>;
}) {
  return (
    <Sheet.Content className="flex-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-1 flex flex-col gap-5">
          <SpinAddCampaignCoreFields form={spinForm} />
          <SpinAddCampaignMoreFields form={spinForm} />
        </div>
      </ScrollArea>
    </Sheet.Content>
  );
}
