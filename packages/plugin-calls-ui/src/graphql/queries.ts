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
    }
  }
`;

const callCustomerDetail: string = `
  query callsCustomerDetail($callerNumber: String) {
    callsCustomerDetail(callerNumber: $callerNumber){
      _id
      firstName
      primaryPhone
      avatar
      phones
      phone
      tagIds
        ${
          isEnabled('tags')
            ? `
          getTags {
            _id
            name
            colorCode
                    type

          }
        `
            : ``
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
  query CallHistories($limit: Int, $callStatus: String, $callType: String, $startDate: String, $endDate: String, $skip: Int) {
    callHistories(limit: $limit, callStatus: $callStatus, callType: $callType, startDate: $startDate, endDate: $endDate, skip: $skip) {
      _id
    receiverNumber
    callerNumber
    callDuration
    callStartTime
    callEndTime
    callType
    callStatus
    sessionId
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
      ${
        isEnabled('tags')
          ? `
          getTags {
            _id
            name
            colorCode
                    type

          }
        `
          : ``
      }
      phone
      primaryEmail
      primaryPhone
      tagIds
    }
    }
}`;

const callsGetConfigs = `
  query callsGetConfigs {
    callsGetConfigs
  }
`;

export default {
  callsIntegrationDetail,
  callUserIntegrations,
  callCustomerDetail,
  customers,
  activeSession,
  callHistories,
  callsGetConfigs,
};
