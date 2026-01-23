import { useMutation } from '@apollo/client';
import { MutationHookOptions } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { editLotteryStatusMutation } from '../graphql/mutations/lotteryEditStatusMutations';
import { getCampaignsQuery } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';

export function useLotteryStatusEdit() {
  const { toast } = useToast();

  const [editLottery, { loading, error }] = useMutation(
    editLotteryStatusMutation,
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

    return editLottery({
      variables: {
        id: variables._id,
        kind: 'lottery',
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Lottery status updated successfully',
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
