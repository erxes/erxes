import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { getCampaignsQuery } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { editSpinMutation } from '../graphql/mutations/editSpinMutation';

export function useEditSpin() {
  const { toast } = useToast();

  const [editSpin, { loading, error }] = useMutation(editSpinMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
      },
    ],
  });

  const spinEdit = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editSpin({
      variables: {
        _id: variables._id,
        name: variables.name,
        kind: 'spin',
        buyScore: variables.buyScore,
        startDate: variables.startDate,
        endDate: variables.endDate,
        status: variables.status,
        type: variables.type,
        conditions: variables.conditions,
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Spin campaign updated successfully',
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

  return { spinEdit, loading, error };
}
