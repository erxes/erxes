import { gql } from '@apollo/client';

export const ASSIGNMENTS_ADD_MUTATION = gql`
  mutation AssignmentsAdd(
    $campaignId: String
    $ownerType: String
    $ownerId: String
  ) {
    assignmentsAdd(
      campaignId: $campaignId
      ownerType: $ownerType
      ownerId: $ownerId
    ) {
      _id
      campaignId
      ownerType
      ownerId
      status
      createdAt
    }
  }
`;

export const ASSIGNMENTS_REMOVE_MUTATION = gql`
  mutation AssignmentsRemove($_ids: [String]) {
    assignmentsRemove(_ids: $_ids)
  }
`;
