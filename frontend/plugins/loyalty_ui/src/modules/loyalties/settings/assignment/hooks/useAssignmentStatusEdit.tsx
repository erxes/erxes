import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { UPDATE_ASSIGNMENT_CAMPAIGN } from '../graphql/mutations/assignmentEditStatusMutations';
import { QUERY_ASSIGNMENT_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';

export function useAssignmentStatusEdit() {
  const { toast } = useToast();

  const [editAssignment, { loading, error }] = useMutation(
    UPDATE_ASSIGNMENT_CAMPAIGN,
    {
      refetchQueries: [
        {
          query: QUERY_ASSIGNMENT_CAMPAIGNS,
        },
      ],
    },
  );

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editAssignment({
      variables: {
        _id: variables._id,
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Assignment status updated successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { editStatus, loading, error };
}
