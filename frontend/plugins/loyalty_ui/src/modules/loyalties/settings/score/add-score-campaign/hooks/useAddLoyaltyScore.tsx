import { useMutation, MutationHookOptions } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { LOYALTY_SCORE_CURSOR_SESSION_KEY } from '../../constants/loyaltyScoreCursorSessionKey';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../../graphql/queries/loyaltyScoreCampaignQuery';
import { LOYALTY_SCORE_ADD_MUTATION } from '../graphql/mutations/loyaltyScoreAddMutation';

export interface AddScoreResult {
  createCampaign: any;
}

export interface AddScoreVariables {
  name: string;
  kind: string;
  conditions: {
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
  >(LOYALTY_SCORE_ADD_MUTATION, {
    refetchQueries: [
      {
        query: LOYALTY_SCORE_CAMPAIGN_QUERY,
        variables: { kind: 'score', limit: SCORE_PER_PAGE, cursor },
      },
    ],
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.createCampaign;

        if (!newCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: LOYALTY_SCORE_CAMPAIGN_QUERY,
          variables: { kind: 'score', limit: SCORE_PER_PAGE, cursor },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: LOYALTY_SCORE_CAMPAIGN_QUERY,
          variables: { kind: 'score', limit: SCORE_PER_PAGE, cursor },
          data: {
            getCampaigns: {
              ...existingData.getCampaigns,
              list: [newCampaign, ...existingData.getCampaigns.list],
              totalCount: (existingData.getCampaigns.totalCount || 0) + 1,
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
