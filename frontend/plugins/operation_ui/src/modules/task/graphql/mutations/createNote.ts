import { gql } from '@apollo/client';

export const CREATE_NOTE = gql`
  mutation CreateNote(
    $content: String
    $contentId: String
    $mentions: [String]
  ) {
    createNote(content: $content, contentId: $contentId, mentions: $mentions) {
      _id
    }
  }
`;
