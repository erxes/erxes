import { useMutation } from '@apollo/client';
import { MutationHookOptions } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { getCampaignsQuery } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { editLotteryStatusMutation } from '../graphql/mutations/lotteryEditStatusMutations';

export function useEditLottery() {
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

  const lotteryEdit = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editLottery({
      variables: {
        _id: variables._id,
        name: variables.name,
        kind: 'lottery',
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
          description: 'Lottery campaign updated successfully',
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

  return { lotteryEdit, loading, error };
}
