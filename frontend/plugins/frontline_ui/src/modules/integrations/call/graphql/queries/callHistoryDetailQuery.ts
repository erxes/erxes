import { gql } from '@apollo/client';

export const CALL_HISTORY_DETAIL = gql`
  query CallHistoryDetail($conversationId: String) {
    callHistoryDetail(conversationId: $conversationId) {
      _id
      operatorPhone
      customerPhone
      callDuration
      callStartTime
      callEndTime
      callType
      callStatus
      timeStamp
      modifiedAt
      createdAt
      createdBy
      modifiedBy
      extensionNumber
      conversationId
      recordUrl
      acctId
      inboxIntegrationId
    }
  }
`;
