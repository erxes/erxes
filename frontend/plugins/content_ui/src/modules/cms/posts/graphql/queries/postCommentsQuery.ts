import { gql } from '@apollo/client';

export const POST_COMMENTS = gql`
  query CmsPostComments(
    $postId: String!
    $clientPortalId: String!
    $parentId: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
  ) {
    cmsPostComments(
      postId: $postId
      clientPortalId: $clientPortalId
      parentId: $parentId
      limit: $limit
      cursor: $cursor
      direction: $direction
    ) {
      comments {
        _id
        postId
        clientPortalId
        content
        authorKind
        authorId
        parentId
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
      __typename
    }
  }
`;
