import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';
import { REMOVE_SPIN_CAMPAIGN } from '../graphql/mutations/removeSpinMutations';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { SPINS_PER_PAGE } from './useSpins';

export const useDeleteSpin = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: SPINS_CURSOR_SESSION_KEY,
  });

  const [removeSpin, { loading }] = useMutation(REMOVE_SPIN_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_SPIN_CAMPAIGNS,
        variables: {
          limit: SPINS_PER_PAGE,
          cursor,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    removeSpin,
    loading,
  };
};
