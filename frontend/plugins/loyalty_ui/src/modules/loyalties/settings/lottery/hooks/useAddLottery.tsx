import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  CreateLotteryCampaignMutation,
  CreateLotteryCampaignMutationVariables,
} from '~/gql/graphql';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';
import { CREATE_LOTTERY_CAMPAIGN } from '../graphql/mutations/LotteryMutations';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { LOTTERY_PER_PAGE } from './useLotteries';

export const useAddLottery = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: LOTTERY_CURSOR_SESSION_KEY,
  });
  const [addLottery, { loading, error }] = useMutation(
    CREATE_LOTTERY_CAMPAIGN,
    {
      refetchQueries: [
        {
          query: QUERY_LOTTERY_CAMPAIGNS,
          variables: { limit: LOTTERY_PER_PAGE, cursor },
        },
      ],
    },
  );

  const lotteryAdd = async (
    options: MutationHookOptions<
      CreateLotteryCampaignMutation,
      CreateLotteryCampaignMutationVariables
    >,
  ) => {
    return addLottery({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('lottery-campaign-created'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return {
    lotteryAdd,
    loading,
    error,
  };
};
