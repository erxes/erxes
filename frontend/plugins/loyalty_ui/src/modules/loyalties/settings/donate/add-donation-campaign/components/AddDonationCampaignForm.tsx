import { ScrollArea, Sheet } from 'erxes-ui';
import { DonationFormValues } from '../../constants/donationFormSchema';
import { DonationAddCampaignCoreFields } from './donation-field/DonationAddCampaignCoreFields';
import { DonationAddCampaignMoreFields } from './donation-field/DonationAddCampaignMoreFields';
import { UseFormReturn } from 'react-hook-form';

export function AddDonationCampaignForm({
  form: donationForm,
}: {
  form: UseFormReturn<DonationFormValues>;
}) {
  return (
    <Sheet.Content className="flex-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-5 flex flex-col gap-5">
          <DonationAddCampaignCoreFields form={donationForm} />
          <DonationAddCampaignMoreFields form={donationForm} />
        </div>
      </ScrollArea>
    </Sheet.Content>
  );
}
