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
