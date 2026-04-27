import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { AddAssignmentCampaignForm } from '../../add-assignment-campaign/components/AddAssignmentCampaignForm';
import { AssignmentFormValues } from '../../constants/assignmentFormSchema';
import { useAssignmentDetailWithQuery } from '../hooks/useAssignmentDetailWithQuery';
import { useAssignmentEdit } from '../hooks/useAssignmentEdit';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<AssignmentFormValues>;
};

export const EditAssignmentTabs = ({ onOpenChange, form }: Props) => {
  const { assignmentEdit, loading: editLoading } = useAssignmentEdit();
  const { assignmentDetail } = useAssignmentDetailWithQuery();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!assignmentDetail?._id) return;

    const data = form.getValues();

    const formatDate = (date: string | Date | undefined): Date | undefined => {
      if (!date) return undefined;
      if (date instanceof Date) {
        return date;
      }
      return new Date(date);
    };

    const variables: any = {
      _id: assignmentDetail._id,
      title: data.title || '',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),
      voucherCampaignId: data.voucherCampaignId || '',
      segmentIds: data.segmentIds || '',
    };

    assignmentEdit({
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
          <AddAssignmentCampaignForm form={form} />
        </div>
        {renderFooter()}
      </div>
    </Form>
  );
};
