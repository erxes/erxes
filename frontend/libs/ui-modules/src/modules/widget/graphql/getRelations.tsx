import { gql } from '@apollo/client';

export const GET_RELATIONS_BY_ENTITY = gql`
  query getRelationsByEntity(
    $contentId: String!
    $contentType: String!
    $relatedContentType: String!
  ) {
    getRelationsByEntity(
      contentId: $contentId
      contentType: $contentType
      relatedContentType: $relatedContentType
    ) {
      _id
      entities {
        contentType
        contentId
      }
    }
  }
`;

export const GET_RELATIONS_BY_CONTENT_IDS = gql`
  query getRelationsByContentIds(
    $contentType: String!
    $contentIds: [String!]!
    $relatedContentType: String!
  ) {
    getRelationsByContentIds(
      contentType: $contentType
      contentIds: $contentIds
      relatedContentType: $relatedContentType
    ) {
      _id
      entities {
        contentType
        contentId
      }
    }
  }
`;
