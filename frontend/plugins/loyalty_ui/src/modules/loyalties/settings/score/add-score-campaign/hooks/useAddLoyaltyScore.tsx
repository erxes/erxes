import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { LOYALTY_SCORE_CURSOR_SESSION_KEY } from '../../constants/loyaltyScoreCursorSessionKey';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../../graphql/queries/loyaltyScoreCampaignQuery';
import { CREATE_SCORE_CAMPAIGN } from '../graphql/mutations/loyaltyScoreAddMutation';

export interface AddScoreCampaignResult {
  scoreCampaignAdd: any;
}

export interface CardBasedRuleVariable {
  boardId?: string;
  pipelineId?: string;
  stageIds?: string[];
  refundStageIds?: string[];
}

export interface AddScoreCampaignVariables {
  title: string;
  description?: string;
  order?: number;
  serviceName: string;
  restrictions: {
    productCategoryIds?: string;
    excludeProductCategoryIds?: string;
    productIds?: string;
    excludeProductIds?: string;
    tagIds?: string;
    excludeTagIds?: string;
  };
  additionalConfig?: {
    discountCheck?: boolean;
    cardBasedRule?: CardBasedRuleVariable[];
  };
  add?: { placeholder?: string; currencyRatio?: string };
  subtract?: { placeholder?: string; currencyRatio?: string };
  set?: { placeholder?: string; currencyRatio?: string };
  ownerType?: string;
  onlyClientPortal?: boolean;
  fieldGroupId?: string;
  fieldOrigin?: string;
  fieldName?: string;
  fieldId?: string;
}
export const SCORE_PER_PAGE = 30;

export const useAddScoreCampaign = () => {
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: LOYALTY_SCORE_CURSOR_SESSION_KEY,
  });

  const [addScore, { loading, error }] = useMutation<
    AddScoreCampaignResult,
    AddScoreCampaignVariables
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

  const scoreCampaignAdd = async (
    options: MutationHookOptions<
      AddScoreCampaignResult,
      AddScoreCampaignVariables
    >,
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
    scoreCampaignAdd,
    loading,
    error,
  };
};
