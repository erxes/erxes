import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  CreateScoreCampaignMutation,
  CreateScoreCampaignMutationVariables,
} from '~/gql/graphql';
import { LOYALTY_SCORE_CURSOR_SESSION_KEY } from '../../constants/loyaltyScoreCursorSessionKey';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../../graphql/queries/loyaltyScoreCampaignQuery';
import { CREATE_SCORE_CAMPAIGN } from '../graphql/mutations/loyaltyScoreAddMutation';

export const SCORE_PER_PAGE = 30;

export const useAddScoreCampaign = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: LOYALTY_SCORE_CURSOR_SESSION_KEY,
  });

  const [addScore, { loading, error }] = useMutation(CREATE_SCORE_CAMPAIGN, {
    refetchQueries: [
      {
        query: LOYALTY_SCORE_CAMPAIGN_QUERY,
        variables: { limit: SCORE_PER_PAGE, cursor },
      },
      // Campaign pickers list from their own query.
      'ScoreCampaignsSimple',
    ],
  });

  const scoreCampaignAdd = async (
    options: MutationHookOptions<
      CreateScoreCampaignMutation,
      CreateScoreCampaignMutationVariables
    >,
  ) => {
    return addScore({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('score-campaign-created'),
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
    scoreCampaignAdd,
    loading,
    error,
  };
};
