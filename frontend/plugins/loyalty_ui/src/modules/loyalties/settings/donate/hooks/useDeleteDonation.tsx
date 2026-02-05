import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { QUERY_DONATE_CAMPAIGNS } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';
import { REMOVE_DONATE_CAMPAIGN } from '../graphql/mutations/removeDonationMutations';
import { DONATIONS_PER_PAGE } from './useDonations';

export const useDeleteDonation = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: DONATIONS_CURSOR_SESSION_KEY,
  });

  const [removeDonation, { loading }] = useMutation(REMOVE_DONATE_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_DONATE_CAMPAIGNS,
        variables: {
          limit: DONATIONS_PER_PAGE,
          cursor,
        },
      },
    ],
    update: (cache, { data }) => {
      try {
        const deletedCampaign = data?.donateCampaignsRemove || {};

        if (!deletedCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_DONATE_CAMPAIGNS,
          variables: {
            limit: DONATIONS_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.donateCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_DONATE_CAMPAIGNS,
          variables: {
            limit: DONATIONS_PER_PAGE,
            cursor,
          },
          data: {
            donateCampaigns: {
              ...existingData.donateCampaigns,
              list: existingData.donateCampaigns.list.filter(
                (campaign: any) =>
                  !deletedCampaign?._ids?.includes(campaign._id),
              ),
              totalCount: Math.max(
                (existingData.donateCampaigns.totalCount || 0) -
                  deletedCampaign?._ids?.length,
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
    removeDonation,
    loading,
  };
};
