import { gql } from '~/gql';

export const CALL_CUSTOMER_ADD = gql(`
  mutation CallAddCustomer(
    $inboxIntegrationId: String
    $primaryPhone: String
    $queueName: String
  ) {
    callAddCustomer(
      inboxIntegrationId: $inboxIntegrationId
      primaryPhone: $primaryPhone
      queueName: $queueName
    ) {
      channels {
        _id
        name
      }
      integration {
        _id
        name
      }
      customer {
        _id
        avatar
        code
        createdAt
        getTags {
          _id
          name
          type
          colorCode
          createdAt
          objectCount
          totalObjectCount
          parentId
          order
          relatedIds
        }
        email
        primaryEmail
        primaryPhone
        tagIds
        lastName
        firstName
        phones
      }
    }
  }
`);

export const CALL_PAUSE_AGENT = gql(`
  mutation callsPauseAgent($status: String!, $integrationId: String!) {
    callsPauseAgent(status: $status, integrationId: $integrationId)
  }
`);

export const CALL_TRANSFER = gql(`
  mutation callTransfer(
    $extensionNumber: String!
    $integrationId: String!
    $direction: String
  ) {
    callTransfer(
      extensionNumber: $extensionNumber
      integrationId: $integrationId
      direction: $direction
    )
  }
`);

export const CALL_SYNC_RECORD_FILE = gql(`
  mutation callSyncRecordFile($acctId: String!, $inboxId: String!) {
    callSyncRecordFile(acctId: $acctId, inboxId: $inboxId)
  }
`);
