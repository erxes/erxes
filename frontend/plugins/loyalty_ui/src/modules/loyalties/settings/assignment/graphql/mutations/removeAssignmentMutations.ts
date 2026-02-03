import { gql } from '@apollo/client';

export const REMOVE_ASSIGNMENT_CAMPAIGNS = gql`
  mutation RemoveAssignmentCampaigns($_ids: [String]) {
    assignmentCampaignsRemove(_ids: $_ids)
  }
`;
