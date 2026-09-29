import { graphql } from '~/gql';

export const CREATE_NOTE = graphql(`
  mutation CreateNote(
    $content: String
    $contentId: String
    $mentions: [String]
  ) {
    createNote(content: $content, contentId: $contentId, mentions: $mentions) {
      _id
    }
  }
`);
