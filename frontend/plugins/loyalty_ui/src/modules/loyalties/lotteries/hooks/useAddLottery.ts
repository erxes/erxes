import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { LOTTERIES_ADD_MUTATION } from '../graphql/mutations/mutations';

export const useAddLottery = () => {
  const { toast } = useToast();

  const [addLottery, { loading, error }] = useMutation(LOTTERIES_ADD_MUTATION, {
    refetchQueries: ['LotteriesMain'],
  });

  const lotteryAdd = async (variables: {
    campaignId?: string;
    ownerId?: string;
    ownerType?: string;
    status?: string;
    voucherCampaignId?: string;
  }) => {
    return addLottery({
      variables,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Lottery created successfully',
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { lotteryAdd, loading, error };
};
