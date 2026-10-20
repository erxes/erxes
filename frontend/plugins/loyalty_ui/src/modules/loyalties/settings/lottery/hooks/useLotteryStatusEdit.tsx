import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  UpdateLotteryCampaignMutation,
  UpdateLotteryCampaignMutationVariables,
} from '~/gql/graphql';
import { UPDATE_LOTTERY_CAMPAIGN } from '../graphql/mutations/lotteryEditStatusMutations';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';

type StatusVariables = Pick<
  UpdateLotteryCampaignMutationVariables,
  '_id' | 'status'
>;

export function useLotteryStatusEdit() {
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

  const editStatus = async (
    options: Omit<
      MutationHookOptions<
        UpdateLotteryCampaignMutation,
        UpdateLotteryCampaignMutationVariables
      >,
      'variables'
    > & { variables: StatusVariables },
  ) => {
    const { variables } = options;

    return editLottery({
      variables: {
        _id: variables._id,
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('lottery-status-updated'),
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

  return { editStatus, loading, error };
}
