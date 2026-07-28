import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { UPDATE_LOTTERY_CAMPAIGN } from '../graphql/mutations/lotteryEditStatusMutations';

export function useEditLottery() {
  const { t } = useTranslation('loyalty');
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
        description: variables.description,
        buyScore: variables.buyScore,
        startDate: variables.startDate,
        endDate: variables.endDate,
        status: variables.status,
        numberFormat: variables.numberFormat,
        awards: variables.awards,
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('lottery-updated'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { lotteryEdit, loading, error };
}
