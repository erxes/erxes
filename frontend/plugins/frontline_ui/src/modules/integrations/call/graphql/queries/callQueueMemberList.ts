import { gql } from '@apollo/client';

export const CALL_QUEUE_MEMBER_LIST = gql`
  query CallQueueMemberList($integrationId: String!, $queue: String!) {
    callQueueMemberList(integrationId: $integrationId, queue: $queue)
  }
`;
