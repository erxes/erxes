import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { ASSIGNMENTS_CURSOR_SESSION_KEY } from '../constants/assignmentsCursorSessionKey';
import { REMOVE_ASSIGNMENT_CAMPAIGNS } from '../graphql/mutations/removeAssignmentMutations';
import { QUERY_ASSIGNMENT_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { ASSIGNMENTS_PER_PAGE } from './useAssignments';

export const useDeleteAssignment = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: ASSIGNMENTS_CURSOR_SESSION_KEY,
  });

  const [removeAssignment, { loading }] = useMutation(
    REMOVE_ASSIGNMENT_CAMPAIGNS,
    {
      refetchQueries: [
        {
          query: QUERY_ASSIGNMENT_CAMPAIGNS,
          variables: {
            limit: ASSIGNMENTS_PER_PAGE,
            cursor,
          },
        },
      ],
      update: (cache, { data }) => {
        try {
          const deletedCampaign = data?.assignmentCampaignsRemove || {};

          if (!deletedCampaign) {
            return;
          }

          const existingData: any = cache.readQuery({
            query: QUERY_ASSIGNMENT_CAMPAIGNS,
            variables: {
              limit: ASSIGNMENTS_PER_PAGE,
              cursor,
            },
          });

          if (!existingData?.assignmentCampaigns) {
            return;
          }

          cache.writeQuery({
            query: QUERY_ASSIGNMENT_CAMPAIGNS,
            variables: {
              limit: ASSIGNMENTS_PER_PAGE,
              cursor,
            },
            data: {
              assignmentCampaigns: {
                ...existingData.assignmentCampaigns,
                list: existingData.assignmentCampaigns.list.filter(
                  (campaign: any) =>
                    !deletedCampaign?._ids?.includes(campaign._id),
                ),
                totalCount: Math.max(
                  (existingData.assignmentCampaigns.totalCount || 0) -
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
    },
  );

  return {
    removeAssignment,
    loading,
  };
};
