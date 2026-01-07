import { useMutation } from '@apollo/client';
import { ApolloCache, MutationHookOptions } from '@apollo/client';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../../graphql/queries/loyaltyScoreCampaignQuery';
import { LOYALTY_SCORE_ADD_MUTATION } from '../graphql/mutations/loyaltyScoreAddMutation';

export interface AddLoyaltyScoreResult {
  scoreCampaignAdd: any;
}

export interface AddLoyaltyScoreVariables {
  title: string;
  description?: string;
  productCategory?: string[];
  product?: string[];
  tags?: string[];
  orExcludeProductCategory?: string[];
  orExcludeProduct?: string[];
  orExcludeTag?: string[];
}

export interface LoyaltyScoreData {
  scoreCampaignAdd: {
    list: any[];
    totalCount: number;
  };
}

export function useAddLoyaltyScore(
  options?: MutationHookOptions<
    AddLoyaltyScoreResult,
    AddLoyaltyScoreVariables
  >,
) {
  const [loyaltyScoreAdd, { loading, error }] = useMutation<
    AddLoyaltyScoreResult,
    AddLoyaltyScoreVariables
  >(LOYALTY_SCORE_ADD_MUTATION, {
    ...options,
    update: (cache: ApolloCache<AddLoyaltyScoreVariables>, { data }) => {
      try {
        const existingData = cache.readQuery<LoyaltyScoreData>({
          query: LOYALTY_SCORE_CAMPAIGN_QUERY,
        });

        if (
          !existingData ||
          !existingData.scoreCampaignAdd ||
          !data?.scoreCampaignAdd
        )
          return;

        cache.writeQuery<LoyaltyScoreData>({
          query: LOYALTY_SCORE_CAMPAIGN_QUERY,
          data: {
            scoreCampaignAdd: {
              ...existingData.scoreCampaignAdd,
              list: [
                ...existingData.scoreCampaignAdd.list,
                data.scoreCampaignAdd,
              ],
              totalCount: existingData.scoreCampaignAdd.totalCount + 1,
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  return { loyaltyScoreAdd, loading, error };
}
