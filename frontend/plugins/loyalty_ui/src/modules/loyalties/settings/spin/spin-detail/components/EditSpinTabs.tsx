import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { AddSpinCampaignForm } from '../../add-spin-campaign/components/AddSpinCampaignForm';
import { SpinFormValues } from '../../constants/spinFormSchema';
import { useEditSpin } from '../../hooks/useEditSpin';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<SpinFormValues>;
  spinId: string | null;
};

export const EditSpinTabs = ({ onOpenChange, form, spinId }: Props) => {
  const { spinEdit, loading: editLoading } = useEditSpin();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!spinId) {
      toast({
        title: 'Error',
        description: 'No spin ID provided',
        variant: 'destructive',
      });
      return;
    }

    const data = form.getValues();

    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
    };

    const variables: any = {
      _id: spinId,
      name: data.title || '',
      kind: 'spin',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),
      conditions: data.conditions?.map((condition) => ({
        name: condition.name,
        voucherCampaignId: condition.voucherCampaignId,
        probablity: condition.probablity,
        buyScore: condition.buyScore,
      })),
    };

    spinEdit({
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
          <AddSpinCampaignForm onOpenChange={onOpenChange} form={form} />
        </div>
        {renderFooter()}
      </div>
    </Form>
  );
};
