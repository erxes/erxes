import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';
import { REMOVE_LOTTERY_CAMPAIGN } from '../graphql/mutations/removeLotteryMutations';
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
    update: (cache, { data }) => {
      try {
        const deletedCampaignIds = data?.lotteryCampaignsRemove || {};

        if (!deletedCampaignIds) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_LOTTERY_CAMPAIGNS,
          variables: {
            limit: LOTTERY_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.lotteryCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_LOTTERY_CAMPAIGNS,
          variables: {
            limit: LOTTERY_PER_PAGE,
            cursor,
          },
          data: {
            lotteryCampaigns: {
              ...existingData.lotteryCampaigns,
              list: existingData.lotteryCampaigns.list.filter(
                (campaign: any) => !deletedCampaignIds.includes(campaign._id),
              ),
              totalCount: Math.max(
                (existingData.lotteryCampaigns.totalCount || 0) -
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
