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
      name
      operators
      phone
      wsServer
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
  query CallConfigExtensionList($integrationId: String!) {
    callExtensionList(integrationId: $integrationId)
  }
`;

export const CALL_QUEUE_INITIAL_LIST = gql`
  query callQueueInitialList($queue: String!) {
    callQueueInitialList(queue: $queue)
  }
`;
