import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { LOYALTY_SCORE_CURSOR_SESSION_KEY } from '../../constants/loyaltyScoreCursorSessionKey';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../../graphql/queries/loyaltyScoreCampaignQuery';
import { CREATE_SCORE_CAMPAIGN } from '../graphql/mutations/loyaltyScoreAddMutation';

export interface AddScoreResult {
  scoreCampaignAdd: any;
}

export interface AddScoreVariables {
  name: string;
  serviceName: string;
  restrictions: {
    productCategoryIds?: string;
    excludeProductCategoryIds?: string;
    productIds?: string;
    excludeProductIds?: string;
    tagIds?: string;
    excludeTagIds?: string;
  };
}
export const SCORE_PER_PAGE = 30;

export const useAddScore = () => {
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: LOYALTY_SCORE_CURSOR_SESSION_KEY,
  });

  const [addScore, { loading, error }] = useMutation<
    AddScoreResult,
    AddScoreVariables
  >(CREATE_SCORE_CAMPAIGN, {
    refetchQueries: [
      {
        query: LOYALTY_SCORE_CAMPAIGN_QUERY,
        variables: { limit: SCORE_PER_PAGE, cursor },
      },
    ],
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.scoreCampaignAdd;

        if (!newCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: LOYALTY_SCORE_CAMPAIGN_QUERY,
          variables: { limit: SCORE_PER_PAGE, cursor },
        });

        if (!existingData?.scoreCampaigns) {
          return;
        }

        cache.writeQuery({
          query: LOYALTY_SCORE_CAMPAIGN_QUERY,
          variables: { limit: SCORE_PER_PAGE, cursor },
          data: {
            scoreCampaigns: {
              ...existingData.scoreCampaigns,
              list: [newCampaign, ...existingData.scoreCampaigns.list],
              totalCount: (existingData.scoreCampaigns.totalCount || 0) + 1,
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  const scoreAdd = async (
    options: MutationHookOptions<AddScoreResult, AddScoreVariables>,
  ) => {
    return addScore({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Score campaign created successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return {
    scoreAdd,
    loading,
    error,
  };
};
