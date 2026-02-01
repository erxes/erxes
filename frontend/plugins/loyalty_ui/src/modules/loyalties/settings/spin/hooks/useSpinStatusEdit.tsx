import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { getCampaignsQuery } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { editSpinStatusMutation } from '../graphql/mutations/spinEditStatusMutations';

export function useSpinStatusEdit() {
  const { toast } = useToast();

  const [editSpin, { loading, error }] = useMutation(editSpinStatusMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
      },
    ],
  });

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editSpin({
      variables: {
        id: variables._id,
        kind: 'spin',
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Spin status updated successfully',
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
