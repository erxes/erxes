import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { getCampaignsQuery } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';
import { DONATIONS_PER_PAGE } from './useDonations';
import { removeDonationMutation } from '../graphql/mutations/removeDonationMutations';

export const useDeleteDonation = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: DONATIONS_CURSOR_SESSION_KEY,
  });

  const [removeDonation, { loading }] = useMutation(removeDonationMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
        variables: {
          kind: 'donation',
          limit: DONATIONS_PER_PAGE,
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
            kind: 'donation',
            limit: DONATIONS_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: getCampaignsQuery,
          variables: {
            kind: 'donation',
            limit: DONATIONS_PER_PAGE,
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
    removeDonation,
    loading,
  };
};
