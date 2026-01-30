import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { removeAssignmentMutation } from '../graphql/mutations/removeAssignmentMutations';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';
import { ASSIGNMENTS_CURSOR_SESSION_KEY } from '../constants/assignmentsCursorSessionKey';
import { ASSIGNMENTS_PER_PAGE } from './useAssignments';

export const useDeleteAssignment = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: ASSIGNMENTS_CURSOR_SESSION_KEY,
  });

  const [removeAssignment, { loading }] = useMutation(
    removeAssignmentMutation,
    {
      refetchQueries: [
        {
          query: getCampaignsQuery,
          variables: {
            kind: 'assignment',
            limit: ASSIGNMENTS_PER_PAGE,
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
              kind: 'assignment',
              limit: ASSIGNMENTS_PER_PAGE,
              cursor,
            },
          });

          if (!existingData?.getCampaigns) {
            return;
          }

          cache.writeQuery({
            query: getCampaignsQuery,
            variables: {
              kind: 'assignment',
              limit: ASSIGNMENTS_PER_PAGE,
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
    },
  );

  return {
    removeAssignment,
    loading,
  };
};
