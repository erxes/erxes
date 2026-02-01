import { ApolloError } from '@apollo/client';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { AssignmentFormValues } from '../../constants/assignmentFormSchema';
import { useAddAssignment } from '../../hooks/useAddAssignment';
import { AddAssignmentCampaignForm } from './AddAssignmentCampaignForm';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<AssignmentFormValues>;
};

export const AssignmentTabs = ({ onOpenChange, form }: Props) => {
  const { assignmentAdd, loading: editLoading } = useAddAssignment();
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
      name: data.title || '',
      kind: 'assignment',
      status: data.status || 'active',
      startDate: formatDate(data.startDate),
      endDate: formatDate(data.endDate),
      conditions: {
        voucherCampaignId: data.conditions.voucherCampaignId,
        segmentId: data.conditions.segmentId,
      },
    };

    assignmentAdd({
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
          <AddAssignmentCampaignForm form={form} />
        </div>
        {renderFooter()}
      </div>
    </Form>
  );
};
