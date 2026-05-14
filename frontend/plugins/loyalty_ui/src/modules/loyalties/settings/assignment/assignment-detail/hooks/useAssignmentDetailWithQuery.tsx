import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { QUERY_ASSIGNMENT_CAMPAIGN } from '../../graphql/queries/getCampaignQuery';
import { IAssignment } from '../../types/assignmentTypes';

export const useAssignmentDetailWithQuery = () => {
  const [editAssignmentId] = useQueryState('editAssignmentId');

  const { data, loading, error } = useQuery(QUERY_ASSIGNMENT_CAMPAIGN, {
    variables: {
      _id: editAssignmentId || '',
    },
    skip: !editAssignmentId,
  });

  return {
    assignmentDetail: data?.assignmentCampaignDetail as IAssignment,
    loading,
    error,
  };
};
