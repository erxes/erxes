import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { LOTTERIES_EDIT_MUTATION } from '../graphql/mutations/mutations';

export const useEditLottery = () => {
  const { toast } = useToast();

  const [editLottery, { loading, error }] = useMutation(
    LOTTERIES_EDIT_MUTATION,
    {
      refetchQueries: ['LotteriesMain'],
    },
  );

  const lotteryEdit = async (variables: {
    _id: string;
    campaignId?: string;
    ownerId?: string;
    ownerType?: string;
    status?: string;
    voucherCampaignId?: string;
  }) => {
    return editLottery({
      variables,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Lottery updated successfully',
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

  return { lotteryEdit, loading, error };
};
