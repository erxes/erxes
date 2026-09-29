import { gql } from '~/gql';

export const ACTIVITY_CHANGED = gql(`
  subscription operationActivityChanged($contentId: String!) {
    operationActivityChanged(contentId: $contentId) {
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
`);
