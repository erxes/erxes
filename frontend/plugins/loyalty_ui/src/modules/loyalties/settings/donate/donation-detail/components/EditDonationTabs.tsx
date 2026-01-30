import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { AddDonationCampaignForm } from '../../add-donation-campaign/components/AddDonationCampaignForm';
import { UseFormReturn } from 'react-hook-form';
import { DonationFormValues } from '../../constants/donationFormSchema';
import { useDonationEdit } from '../hooks/useDonationEdit';
import { ApolloError } from '@apollo/client';
import { useDonationDetailWithQuery } from '../hooks/useDonationDetailWithQuery';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DonationFormValues>;
};

export const EditDonationTabs = ({ onOpenChange, form }: Props) => {
  const { donationEdit, loading: editLoading } = useDonationEdit();
  const { donationDetail } = useDonationDetailWithQuery();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!donationDetail?._id) return;

    const data = form.getValues();

    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
    };

    const variables: any = {
      id: donationDetail._id,
      name: data.title || '',
      kind: 'donation',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),
      conditions: data.conditions?.map((condition) => ({
        voucherCampaignId: condition.voucherCampaignId,
        minScore: condition.minScore,
        maxScore: condition.maxScore,
      })),
    };

    donationEdit({
      variables,
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
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
        {editLoading ? 'Updating...' : 'Update'}
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
