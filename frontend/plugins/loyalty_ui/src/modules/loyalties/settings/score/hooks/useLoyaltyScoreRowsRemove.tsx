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
    awaitRefetchQueries: true,
  });

  return {
    removeScore,
    loading,
  };
};
