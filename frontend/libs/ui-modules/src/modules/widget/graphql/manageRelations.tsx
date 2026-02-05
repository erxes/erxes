import { gql } from '@apollo/client';

export const MANAGE_RELATIONS = gql`
  mutation ManageRelations(
    $contentType: String!
    $contentId: String!
    $relatedContentType: String!
    $relatedContentIds: [String]
  ) {
    manageRelations(
      contentType: $contentType
      contentId: $contentId
      relatedContentType: $relatedContentType
      relatedContentIds: $relatedContentIds
    ) {
      _id
      entities {
        contentType
        contentId
      }
    }
  }
`;
