import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { UPDATE_LOTTERY_CAMPAIGN } from '../graphql/mutations/lotteryEditStatusMutations';

export function useLotteryStatusEdit() {
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

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editLottery({
      variables: {
        _id: variables._id,
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
