import { gql } from '@apollo/client';

export const ACTIVITY_CHANGED = gql`
  subscription ticketActivityChanged($contentId: String!) {
    ticketActivityChanged(contentId: $contentId) {
      type
      activity {
        _id
        module
        action
        contentId
        metadata {
          newValue
          previousValue
        }
        createdBy
        createdAt
        updatedAt
      }
    }
  }
`;
