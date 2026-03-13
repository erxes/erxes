import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { UPDATE_LOTTERY_CAMPAIGN } from '../graphql/mutations/lotteryEditStatusMutations';

export function useEditLottery() {
  const { toast } = useToast();

  const [editLottery, { loading, error }] = useMutation(
    UPDATE_LOTTERY_CAMPAIGN,
    {
      refetchQueries: [
        {
          query: QUERY_LOTTERY_CAMPAIGNS,
        },
      ],
    },
  );

  const lotteryEdit = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editLottery({
      variables: {
        _id: variables._id,
        title: variables.title,
        buyScore: variables.buyScore,
        startDate: variables.startDate,
        endDate: variables.endDate,
        status: variables.status,
        type: variables.type,
        awards: variables.awards,
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
