import { gql } from '@apollo/client';

export const CLIENT_PORTAL_REMOVE = gql`
  mutation ClientPortalRemove($_id: String!) {
    clientPortalRemove(_id: $_id)
  }
`;

export const ARTICLES = gql`
  query knowledgeBaseArticles(
    $limit: Int
    $cursor: String
    $direction: String
    $categoryIds: [String]
  ) {
    knowledgeBaseArticles(
      limit: $limit
      cursor: $cursor
      direction: $direction
      categoryIds: $categoryIds
    ) {
      list {
        _id
        title
        code
        summary
        content
        status
        categoryId
        createdDate
        modifiedDate
        createdUser {
          _id
          username
          email
        }
        publishedUser {
          _id
          username
          email
          details {
            avatar
            fullName
          }
        }
        createdBy
        modifiedBy
        tags
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      totalCount
    }
  }
`;
