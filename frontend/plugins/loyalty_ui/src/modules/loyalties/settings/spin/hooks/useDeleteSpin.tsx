import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { getCampaignsQuery } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';
import { SPINS_PER_PAGE } from './useSpins';
import { removeSpinMutation } from '../graphql/mutations/removeSpinMutations';

export const useDeleteSpin = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: SPINS_CURSOR_SESSION_KEY,
  });

  const [removeSpin, { loading }] = useMutation(removeSpinMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
        variables: {
          kind: 'spin',
          limit: SPINS_PER_PAGE,
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
            kind: 'spin',
            limit: SPINS_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: getCampaignsQuery,
          variables: {
            kind: 'spin',
            limit: SPINS_PER_PAGE,
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
    removeSpin,
    loading,
  };
};
