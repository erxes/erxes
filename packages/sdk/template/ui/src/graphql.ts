import { gql } from './gql';

// Documents for the extension's own schema, checked by erxes-ext codegen.

export const NOTE_LIST = gql(`
  query extTemplateNoteList {
    extTemplateNotes {
      _id
      text
      createdAt
    }
  }
`);

export const NOTE_ADD = gql(`
  mutation extTemplateNoteAdd($text: String!) {
    extTemplateNotesAdd(text: $text) {
      _id
    }
  }
`);
