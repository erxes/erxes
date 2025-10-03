import { gql } from '@apollo/client';

export const INTERNAL_NOTE_ADD = gql`
  mutation internalNotesAdd(
    $contentType: String!
    $contentTypeId: String
    $content: String
    $mentionedUserIds: [String]
  ) {
    internalNotesAdd(
      contentType: $contentType
      contentTypeId: $contentTypeId
      content: $content
      mentionedUserIds: $mentionedUserIds
    ) {
      _id
      content
      createdAt
    }
  }
`;
