import { useMutation } from '@apollo/client';
import { LOYALTY_SCORE_ROW_REMOVE } from '../graphql/mutations/loyaltyScoreRowsRemove';

export const useLoyaltyScoreRowsRemove = () => {
  const [removeLoyaltyScoreRows, { loading }] = useMutation(
    LOYALTY_SCORE_ROW_REMOVE,
    {
      refetchQueries: ['LoyaltyScoreRows'],
    },
  );

  return {
    removeLoyaltyScoreRows,
    loading,
  };
};
