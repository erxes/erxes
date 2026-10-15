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
      awaitRefetchQueries: true,
    },
  );

  return {
    removeAssignment,
    loading,
  };
};
