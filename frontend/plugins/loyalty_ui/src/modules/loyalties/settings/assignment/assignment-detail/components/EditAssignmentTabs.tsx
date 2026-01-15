import { Button, Form, Sheet } from 'erxes-ui';
import { AddAssignmentCampaignForm } from '../../add-assignment-campaign/components/AddAssignmentCampaignForm';

import { UseFormReturn } from 'react-hook-form';
import { AssignmentFormValues } from '../../constants/assignmentFormSchema';
import { useAssignmentEdit } from '../hooks/useAssignmentEdit';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useAssignmentDetailWithQuery } from '../hooks/useAssignmentDetailWithQuery';

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

    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
    };

    const variables: any = {
      id: assignmentDetail._id,
      name: data.title || '',
      kind: 'assignment',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),
      conditions: {
        voucherCampaignId: data.conditions.voucherCampaignId || '',
        segmentId: data.conditions.segmentId || '',
      },
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
          <AddAssignmentCampaignForm onOpenChange={onOpenChange} form={form} />
        </div>
        {renderFooter()}
      </div>
    </Form>
  );
};
