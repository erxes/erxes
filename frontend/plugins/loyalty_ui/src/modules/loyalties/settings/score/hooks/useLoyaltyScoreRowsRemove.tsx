import { useMutation } from '@apollo/client';
import { LOYALTY_SCORE_ROW_REMOVE } from '../graphql/mutations/loyaltyScoreRowsRemove';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../graphql/queries/loyaltyScoreCampaignQuery';

export const useLoyaltyScoreRowsRemove = () => {
  const [removeLoyaltyScoreRows, { loading }] = useMutation(
    LOYALTY_SCORE_ROW_REMOVE,
    {
      refetchQueries: [
        {
          query: LOYALTY_SCORE_CAMPAIGN_QUERY,
          variables: {
            kind: 'score',
          },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  return {
    removeLoyaltyScoreRows,
    loading,
  };
};
