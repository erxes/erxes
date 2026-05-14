import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { QUERY_ASSIGNMENT_CAMPAIGNS } from '../../graphql';
import { UPDATE_ASSIGNMENT_CAMPAIGN } from '../../graphql/mutations/assignmentEditStatusMutations';

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
  voucherCampaignId?: string;
  segmentIds?: string[];
}

export const useAssignmentEdit = () => {
  const { toast } = useToast();

  const [assignmentEdit, { loading }] = useMutation<
    any,
    EditAssignmentVariables
  >(UPDATE_ASSIGNMENT_CAMPAIGN, {
    refetchQueries: [QUERY_ASSIGNMENT_CAMPAIGNS],
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
