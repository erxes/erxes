import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { getCampaignsQuery } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';
import { LOTTERY_PER_PAGE } from './useLotteries';
import { removeLotteryMutation } from '../graphql/mutations/removeLotteryMutations';

export const useDeleteLottery = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: LOTTERY_CURSOR_SESSION_KEY,
  });

  const [removeLottery, { loading }] = useMutation(removeLotteryMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
        variables: {
          kind: 'lottery',
          limit: LOTTERY_PER_PAGE,
          cursor,
        },
      },
    ],
    update: (cache, { data }) => {
      try {
        const deletedCampaignIds = data?.removeCampaign?._id || [];

        if (!deletedCampaignIds.length) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: getCampaignsQuery,
          variables: {
            kind: 'lottery',
            limit: LOTTERY_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: getCampaignsQuery,
          variables: {
            kind: 'lottery',
            limit: LOTTERY_PER_PAGE,
            cursor,
          },
          data: {
            getCampaigns: {
              ...existingData.getCampaigns,
              list: existingData.getCampaigns.list.filter(
                (campaign: any) => !deletedCampaignIds.includes(campaign._id),
              ),
              totalCount: Math.max(
                (existingData.getCampaigns.totalCount || 0) -
                  deletedCampaignIds.length,
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
    removeLottery,
    loading,
  };
};
