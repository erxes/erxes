import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';
import { REMOVE_SPIN_CAMPAIGN } from '../graphql/mutations/removeSpinMutations';
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
    update: (cache, { data }) => {
      try {
        const deletedCampaign = data?.spinCampaignsRemove || {};

        if (!deletedCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_SPIN_CAMPAIGNS,
          variables: {
            limit: SPINS_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.spinCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_SPIN_CAMPAIGNS,
          variables: {
            limit: SPINS_PER_PAGE,
            cursor,
          },
          data: {
            spinCampaigns: {
              ...existingData.spinCampaigns,
              list: existingData.spinCampaigns.list.filter(
                (campaign: any) =>
                  !deletedCampaign?._ids?.includes(campaign._id),
              ),
              totalCount: Math.max(
                (existingData.spinCampaigns.totalCount || 0) -
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
    removeSpin,
    loading,
  };
};
