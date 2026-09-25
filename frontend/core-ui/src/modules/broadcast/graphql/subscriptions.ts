import { gql } from '@apollo/client';

export const BROADCAST_CHANGED = gql`
  subscription BroadcastChanged($engageMessageId: String) {
    broadcastChanged(engageMessageId: $engageMessageId)
  }
`;
