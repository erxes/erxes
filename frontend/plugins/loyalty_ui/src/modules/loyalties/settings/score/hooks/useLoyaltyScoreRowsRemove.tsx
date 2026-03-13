import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../graphql/queries/loyaltyScoreCampaignQuery';
import { LOYALTY_SCORE_CURSOR_SESSION_KEY } from '../constants/loyaltyScoreCursorSessionKey';
import { LOYALTY_SCORE_ROW_REMOVE } from '../graphql/mutations/loyaltyScoreRowsRemove';

export const SCORE_PER_PAGE = 30;

export const useDeleteScore = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: LOYALTY_SCORE_CURSOR_SESSION_KEY,
  });

  const [removeScore, { loading }] = useMutation(LOYALTY_SCORE_ROW_REMOVE, {
    refetchQueries: [
      {
        query: LOYALTY_SCORE_CAMPAIGN_QUERY,
        variables: {
          kind: 'score',
          limit: SCORE_PER_PAGE,
          cursor,
        },
      },
    ],
    update: (cache, { data }) => {
      try {
        const deletedCampaignIds = data?.removeCampaign || [];

        if (!deletedCampaignIds.length) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: LOYALTY_SCORE_CAMPAIGN_QUERY,
          variables: {
            kind: 'score',
            limit: SCORE_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        const deletedIds = deletedCampaignIds.map(
          (campaign: any) => campaign._id,
        );

        cache.writeQuery({
          query: LOYALTY_SCORE_CAMPAIGN_QUERY,
          variables: {
            kind: 'score',
            limit: SCORE_PER_PAGE,
            cursor,
          },
          data: {
            getCampaigns: {
              ...existingData.getCampaigns,
              list: existingData.getCampaigns.list.filter(
                (campaign: any) => !deletedIds.includes(campaign._id),
              ),
              totalCount: Math.max(
                (existingData.getCampaigns.totalCount || 0) - deletedIds.length,
                0,
              ),
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
    awaitRefetchQueries: true,
  });

  return {
    removeScore,
    loading,
  };
};
