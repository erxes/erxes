import { gql } from '@apollo/client';

export const CALL_QUEUE_LIST = gql`
  query callQueueList($inboxId: String!) {
    callQueueList(integrationId: $inboxId)
  }
`;
