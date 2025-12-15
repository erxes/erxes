import { gql } from '@apollo/client';

export const INTERNAL_NOTE_DETAIL = gql`
  query internalNoteDetail($_id: String!) {
    internalNoteDetail(_id: $_id) {
      _id
      content
      contentType
      contentTypeId
      createdAt
      createdUserId
      createdUser {
        _id
        details {
          avatar
          fullName
        }
      }
    }
  }
`;

export const INTERNAL_NOTES = gql`
  query internalNotes($contentType: String!, $contentTypeId: String!) {
    internalNotes(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
      content
      contentType
      contentTypeId
      createdAt
      createdUser {
        _id
        details {
          avatar
          fullName
        }
      }
    }
  }
`;
