import { gql } from '@apollo/client';

export const ADD_ACTIVE_SESSION = gql`
  mutation CallUpdateActiveSession {
    callUpdateActiveSession
  }
`;

export const CALL_TERMINATE_SESSION = gql`
  mutation callTerminateSession {
    callTerminateSession
  }
`;

export const CALL_DISCONNECT = gql`
  mutation callDisconnect {
    callDisconnect
  }
`;
export const CALL_CUSTOMER_ADD = gql`
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
        primaryPhone
        tagIds
        lastName
        firstName
        phones
      }
    }
  }
`;

export const CALL_HISTORY_ADD = gql`
  mutation CallHistoryAdd(
    $inboxIntegrationId: String
    $customerPhone: String
    $callStartTime: Date
    $callStatus: String
    $callType: String
    $timeStamp: Float
    $endedBy: String
    $queueName: String
  ) {
    callHistoryAdd(
      inboxIntegrationId: $inboxIntegrationId
      customerPhone: $customerPhone
      callStartTime: $callStartTime
      callStatus: $callStatus
      callType: $callType
      timeStamp: $timeStamp
      endedBy: $endedBy
      queueName: $queueName
    ) {
      _id
      timeStamp
      conversationId
    }
  }
`;
export const callHistoryEdit = gql`
  mutation CallHistoryEdit(
    $id: String
    $inboxIntegrationId: String
    $customerPhone: String
    $callDuration: Int
    $callStartTime: Date
    $callEndTime: Date
    $callType: String
    $callStatus: String
    $timeStamp: Float
    $transferredCallStatus: String
    $endedBy: String
  ) {
    callHistoryEdit(
      _id: $id
      inboxIntegrationId: $inboxIntegrationId
      customerPhone: $customerPhone
      callDuration: $callDuration
      callStartTime: $callStartTime
      callEndTime: $callEndTime
      callType: $callType
      callStatus: $callStatus
      timeStamp: $timeStamp
      transferredCallStatus: $transferredCallStatus
      endedBy: $endedBy
    )
  }
`;

export const CALL_HISTORY_EDIT_STATUS = gql`
  mutation CallHistoryEditStatus($callStatus: String, $timeStamp: Float) {
    callHistoryEditStatus(callStatus: $callStatus, timeStamp: $timeStamp)
  }
`;

export const CALL_HISTORY_REMOVE = gql`
  mutation CallHistoryRemove($id: String!) {
    callHistoryRemove(_id: $id)
  }
`;

export const CALL_PAUSE_AGENT = gql`
  mutation callsPauseAgent($status: String!, $integrationId: String!) {
    callsPauseAgent(status: $status, integrationId: $integrationId)
  }
`;

export const CALL_TRANSFER = gql`
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
`;

export const CALL_SELECT_CUSTOMER = gql`
  mutation callSelectCustomer(
    $integrationId: String!
    $customerId: String!
    $phoneNumber: String!
    $conversationId: String!
  ) {
    callSelectCustomer(
      integrationId: $integrationId
      customerId: $customerId
      phoneNumber: $phoneNumber
      conversationId: $conversationId
    )
  }
`;

export const CALL_SYNC_RECORD_FILE = `
  mutation callSyncRecordFile($acctId: String!, $inboxId: String!) {
    callSyncRecordFile(acctId: $acctId, inboxId: $inboxId)
  }
`;
