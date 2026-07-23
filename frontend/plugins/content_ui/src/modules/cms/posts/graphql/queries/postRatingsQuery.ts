import { gql } from '@apollo/client';

export const POST_RATINGS = gql`
  query CmsPostRatings(
    $postId: String!
    $clientPortalId: String!
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
  ) {
    cmsPostRatings(
      postId: $postId
      clientPortalId: $clientPortalId
      limit: $limit
      cursor: $cursor
      direction: $direction
    ) {
      ratings {
        _id
        postId
        clientPortalId
        authorId
        rating
        status
        createdAt
        updatedAt
        __typename
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      approvedSummary {
        averageRating
        totalCount
        distribution {
          rating
          count
        }
      }
      __typename
    }
  }
`;
