import { useMutation } from '@apollo/client';
import { MutationHookOptions } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';
import { editAssignmentStatusMutation } from '../graphql/mutations/assignmentEditStatusMutations';

export function useAssignmentStatusEdit() {
  const { toast } = useToast();

  const [editAssignment, { loading, error }] = useMutation(
    editAssignmentStatusMutation,
    {
      refetchQueries: [
        {
          query: getCampaignsQuery,
        },
      ],
    },
  );

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editAssignment({
      variables: {
        id: variables._id,
        kind: 'assignment',
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
