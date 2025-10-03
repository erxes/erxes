import { gql } from '@apollo/client';

export const CALL_GET_CONFIGS = gql`
  query callsGetConfigs {
    callsGetConfigs
  }
`;

export const CALL_INTEGRATION_DETAIL = gql`
  query callsIntegrationDetail($integrationId: String!) {
    callsIntegrationDetail(integrationId: $integrationId) {
      _id
      inboxId
      phone
      wsServer
      operators
      token
      queues
      srcTrunk
      dstTrunk
    }
  }
`;

export const CALL_USER_INTEGRATIONS = gql`
  query callUserIntegrations {
    callUserIntegrations {
      _id
      inboxId
      operators
      phone
      wsServer
      token
      queues
      srcTrunk
      dstTrunk
    }
  }
`;

export const CALL_CUSTOMER_DETAIL = gql`
  query callsCustomerDetail($customerPhone: String) {
    callsCustomerDetail(customerPhone: $customerPhone) {
      _id
      firstName
      primaryPhone
      avatar
      phones
      phone
      tagIds
      getTags {
        _id
        name
        colorCode
        type
      }
    }
  }
`;

export const CALL_ACTIVE_SESSION = gql`
  query callsActiveSession {
    callsActiveSession {
      _id
      userId
      lastLoginDeviceId
    }
  }
`;

export const CALL_HISTORIES = gql`
  query CallHistories(
    $limit: Int
    $callStatus: String
    $callType: String
    $startDate: String
    $endDate: String
    $skip: Int
    $integrationId: String
    $searchValue: String
  ) {
    callHistories(
      limit: $limit
      callStatus: $callStatus
      callType: $callType
      startDate: $startDate
      endDate: $endDate
      skip: $skip
      integrationId: $integrationId
      searchValue: $searchValue
    ) {
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
      customerId
      customer {
        _id
        avatar
        email
        firstName
        getTags {
          _id
          name
          colorCode
          type
        }
        phone
        primaryEmail
        primaryPhone
        tagIds
      }
    }
  }
`;

export const CALL_HISTORIES_TOTAL_COUNT = gql`
  query callHistoriesTotalCount(
    $limit: Int
    $callStatus: String
    $callType: String
    $startDate: String
    $endDate: String
    $integrationId: String
    $searchValue: String
    $skip: Int
  ) {
    callHistoriesTotalCount(
      limit: $limit
      callStatus: $callStatus
      callType: $callType
      startDate: $startDate
      endDate: $endDate
      integrationId: $integrationId
      searchValue: $searchValue
      skip: $skip
    )
  }
`;

export const CALL_GET_AGENT_STATUS = gql`
  query callGetAgentStatus {
    callGetAgentStatus
  }
`;

export const CALL_EXTENSION_LIST = gql`
  query callExtensionList($integrationId: String!) {
    callExtensionList(integrationId: $integrationId)
  }
`;

export const CALL_QUEUE_LIST = gql`
  query callQueueList {
    callQueueList
  }
`;

export const CALL_QUEUE_INITIAL_LIST = gql`
  query callQueueInitialList($queue: String!) {
    callQueueInitialList(queue: $queue)
  }
`;

export const CALL_QUEUE_MEMBER_LIST = gql`
  query callQueueMemberList($integrationId: String!, $queue: String!) {
    callQueueMemberList(integrationId: $integrationId, queue: $queue)
  }
`;

export const CALL_CUSTOMERS = gql`
  query callCustomers($phoneNumber: String!) {
    callCustomers(phoneNumber: $phoneNumber) {
      primaryPhone
      phone
      lastName
      firstName
      _id
    }
  }
`;
