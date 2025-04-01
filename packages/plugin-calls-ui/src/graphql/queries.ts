import { isEnabled } from '@erxes/ui/src/utils/core';

const callsIntegrationDetail: string = `
  query callsIntegrationDetail($integrationId: String!) {
    callsIntegrationDetail(integrationId: $integrationId) {
      _id
      phone
      wsServer
      inboxId
      operators
      token
    }
  }
`;

const callUserIntegrations: any = `
  query callUserIntegrations {
    callUserIntegrations {
      _id
      inboxId
      operators
      phone
      wsServer
      token
      queues
    }
  }
`;

const callCustomerDetail: string = `
  query callsCustomerDetail($customerPhone: String) {
    callsCustomerDetail(customerPhone: $customerPhone){
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

const listParamsDef = `
  $page: Int,
  $perPage: Int,
  $tag: String,
  $type: String,
  $ids: [String],
  $excludeIds: Boolean,
  $searchValue: String,
  $brand: String,
  $integration: String,
  $startDate: String,
  $endDate: String,
  $leadStatus: String,
  $sortField: String,
  $sortDirection: Int,
  $dateFilters: String,
`;

const listParamsValue = `
  page: $page,
  perPage: $perPage,
  tag: $tag,
  type: $type,
  ids: $ids,
  excludeIds: $excludeIds,
  searchValue: $searchValue,
  brand: $brand,
  integration: $integration
  startDate: $startDate,
  endDate: $endDate,
  leadStatus: $leadStatus,
  sortField: $sortField,
  sortDirection: $sortDirection,
  dateFilters: $dateFilters,
`;

const customers = `
  query customers(${listParamsDef}) {
    customers(${listParamsValue}) {
      _id
      firstName
      primaryPhone
      primaryEmail
      phones
      phone
      tagIds
      avatar
    }
  }
`;

const activeSession = `
  query callsActiveSession {
  callsActiveSession{
    _id
    userId
    lastLoginDeviceId
  }
}`;

const callHistories = `
  query CallHistories($limit: Int, $callStatus: String, $callType: String, $startDate: String, $endDate: String, $skip: Int, $integrationId: String, $searchValue: String) {
    callHistories(limit: $limit, callStatus: $callStatus, callType: $callType, startDate: $startDate, endDate: $endDate, skip: $skip, integrationId: $integrationId, searchValue: $searchValue) {
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
    extentionNumber
    conversationId
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
}`;

const callHistoriesTotalCount = `
  query callHistoriesTotalCount($limit: Int, $callStatus: String, $callType: String, $startDate: String, $endDate: String, $integrationId: String, $searchValue: String, $skip: Int) {
    callHistoriesTotalCount(limit: $limit, callStatus: $callStatus, callType: $callType, startDate: $startDate, endDate: $endDate, integrationId: $integrationId, searchValue: $searchValue, skip: $skip)
  }
`;

const callsGetConfigs = `
  query callsGetConfigs {
    callsGetConfigs
  }
`;

const callGetAgentStatus = `
  query callGetAgentStatus {
    callGetAgentStatus
  }
`;

const callExtensionList = `
  query callExtensionList($integrationId: String!) {
  callExtensionList(integrationId: $integrationId)
}
`;

const callQueueList = `
  query callQueueList {
  callQueueList
}
`;

const callWaitingList = `
  query callWaitingList($queue: String!) {
  callWaitingList(queue: $queue)
}
`;

const callProceedingList = `
  query callProceedingList( $queue: String!) {
  callProceedingList(queue: $queue)
}
`;

const callQueueMemberList = `
  query callQueueMemberList($integrationId: String!, $queue: String!) {
  callQueueMemberList(integrationId: $integrationId, queue: $queue)
}
`;

export default {
  callsIntegrationDetail,
  callUserIntegrations,
  callCustomerDetail,
  callHistoriesTotalCount,
  customers,
  activeSession,
  callHistories,
  callsGetConfigs,
  callGetAgentStatus,
  callExtensionList,
  callQueueList,
  callWaitingList,
  callProceedingList,
  callQueueMemberList,
};
