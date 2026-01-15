import { useQuery } from '@apollo/client';
import { IAssignment } from '../../types/assignmentTypes';
import { useQueryState } from 'erxes-ui';
import { getCampaignQuery } from '../../../voucher/graphql/queries/getCampaignQuery';

export const useAssignmentDetailWithQuery = () => {
  const [editAssignmentId] = useQueryState('editAssignmentId');

  const { data, loading, error } = useQuery(getCampaignQuery, {
    variables: {
      id: editAssignmentId || '',
    },
    skip: !editAssignmentId,
  });

  return {
    assignmentDetail: data?.getCampaign as IAssignment,
    loading,
    error,
  };
};
