import { ScrollArea, Sheet } from 'erxes-ui';
import { LotteryFormValues } from '../../constants/lotteryFormSchema';
import { LotteryAddCampaignCoreFields } from './lottery-field/LotteryAddCampaignCoreFields';
import { LotteryAddCampaignMoreFields } from './lottery-field/LotteryAddCampaignMoreFields';
import { UseFormReturn } from 'react-hook-form';

export function AddLotteryCampaignForm({
  form: lotteryForm,
}: {
  form: UseFormReturn<LotteryFormValues>;
}) {
  return (
    <Sheet.Content className="flex-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-1 flex flex-col gap-5">
          <LotteryAddCampaignCoreFields form={lotteryForm} />
          <LotteryAddCampaignMoreFields form={lotteryForm} />
        </div>
      </ScrollArea>
    </Sheet.Content>
  );
}
