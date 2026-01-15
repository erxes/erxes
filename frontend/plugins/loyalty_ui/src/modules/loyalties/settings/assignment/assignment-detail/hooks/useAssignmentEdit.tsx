import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { editAssignmentStatusMutation } from '../../graphql/mutations/assignmentEditStatusMutations';

export interface EditAssignmentVariables {
  id: string;
  name?: string;
  kind?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  amount?: number;
  conditions?: {
    voucherCampaignId?: string;
    segmentId?: string;
  };
}

export const useAssignmentEdit = () => {
  const { toast } = useToast();

  const [assignmentEdit, { loading }] = useMutation<
    any,
    EditAssignmentVariables
  >(editAssignmentStatusMutation, {
    refetchQueries: ['getCampaigns'],
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Assignment updated successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return { assignmentEdit, loading };
};
