import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { DonationFormValues } from '../../constants/donationFormSchema';
import { useAddDonation } from '../../hooks/useAddDonation';
import { AddDonationCampaignForm } from './AddDonationCampaignForm';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DonationFormValues>;
};

export const DonationTabs = ({ onOpenChange, form }: Props) => {
  const { donationAdd, loading: editLoading } = useAddDonation();
  const { toast } = useToast();

  const handleSubmit = async () => {
    const data = form.getValues();

    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
    };

    const variables: any = {
      title: data.title || '',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),
      maxScore: data.maxScore,

      awards: data.awards?.map((award) => ({
        voucherCampaignId: award.voucherCampaignId,
        minScore: award.minScore,
      })),
    };

    donationAdd({
      variables,
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        form.reset();
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
      <Button
        type="button"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handleSubmit}
        disabled={editLoading}
      >
        {editLoading ? 'Saving...' : 'Save'}
      </Button>
    </Sheet.Footer>
  );

  return (
    <Form {...form}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-auto overflow-hidden py-4 px-5">
          <AddDonationCampaignForm form={form} />
        </div>
        {renderFooter()}
      </div>
    </Form>
  );
};
