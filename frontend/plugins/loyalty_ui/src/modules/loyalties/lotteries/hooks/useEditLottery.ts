import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOTTERIES_EDIT_MUTATION } from '../graphql/mutations/mutations';

export const useEditLottery = () => {
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

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
          title: t('success'),
          description: t('lottery-updated'),
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { lotteryEdit, loading, error };
};
