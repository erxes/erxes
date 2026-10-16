import { gql } from '~/gql';

export const CALL_QUEUE_LIST = gql(`
  query callQueueList($inboxId: String!) {
    callQueueList(integrationId: $inboxId) {
      queue
      queuechairman
      totalCalls
      answeredCalls
      answeredRate
      abandonedCalls
      abandonedRate
      avgWait
      avgTalk
    }
  }
`);
