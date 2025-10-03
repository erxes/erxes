import { gql } from '@apollo/client';

export const CALL_HISTORIES = gql`
  query CallHistories(
    $integrationId: String
    $limit: Int
    $searchValue: String
    $skip: Int
    $callType: String
    $callStatus: String
  ) {
    callHistories(
      integrationId: $integrationId
      limit: $limit
      searchValue: $searchValue
      skip: $skip
      callType: $callType
      callStatus: $callStatus
    ) {
      _id
      callStartTime
      callStatus
      callType
      customerPhone
      extensionNumber
      conversationId
    }
    callHistoriesTotalCount(
      limit: $limit
      callStatus: $callStatus
      callType: $callType
      integrationId: $integrationId
      searchValue: $searchValue
      skip: $skip
    )
  }
`;
