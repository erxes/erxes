import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';
import { REMOVE_LOTTERY_CAMPAIGN } from '../graphql/mutations/removeLotteryMutations';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { LOTTERY_PER_PAGE } from './useLotteries';

export const useDeleteLottery = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: LOTTERY_CURSOR_SESSION_KEY,
  });

  const [removeLottery, { loading }] = useMutation(REMOVE_LOTTERY_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_LOTTERY_CAMPAIGNS,
        variables: {
          limit: LOTTERY_PER_PAGE,
          cursor,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    removeLottery,
    loading,
  };
};
