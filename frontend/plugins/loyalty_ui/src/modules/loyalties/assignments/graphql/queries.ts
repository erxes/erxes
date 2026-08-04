import { gql } from '@apollo/client';

export const ASSIGNMENTS_QUERY = gql`
  query AssignmentsMain(
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $campaignId: String
    $ownerType: String
    $ownerId: String
    $status: String
  ) {
    assignments(
      limit: $limit
      cursor: $cursor
      direction: $direction
      campaignId: $campaignId
      ownerType: $ownerType
      ownerId: $ownerId
      status: $status
    ) {
      list {
        _id
        campaignId
        campaign {
          _id
          title
        }
        ownerType
        ownerId
        owner
        status
        createdAt
        usedAt
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const QUERY_ASSIGNMENT_CAMPAIGNS_SIMPLE = gql`
  query AssignmentCampaignsSimple($searchValue: String, $limit: Int) {
    assignmentCampaigns(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        title
        status
      }
    }
  }
`;
