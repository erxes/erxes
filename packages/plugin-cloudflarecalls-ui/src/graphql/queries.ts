import { isEnabled } from '@erxes/ui/src/utils/core';

const callsIntegrationDetail: string = `
  query cloudflareCallsIntegrationDetail($integrationId: String!) {
    cloudflareCallsIntegrationDetail(integrationId: $integrationId) {
      _id
      erxesApiId
      operators
    }
  }
`;

const callUserIntegrations: any = `
  query cloudflareCallsUserIntegrations {
    cloudflareCallsUserIntegrations {
      _id
      erxesApiId
      departments{
        _id
        operators
        name
      }
    }
  }
`;

const callCustomerDetail: string = `
  query cloudflareCallsCustomerDetail($customerPhone: String) {
    cloudflareCallsCustomerDetail(customerPhone: $customerPhone){
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

const callHistories = `
  query cloudflareCallsHistories($limit: Int, $callStatus: String, $callType: String, $startDate: String, $endDate: String, $skip: Int, $integrationId: String, $searchValue: String) {
    cloudflareCallsHistories(limit: $limit, callStatus: $callStatus, callType: $callType, startDate: $startDate, endDate: $endDate, skip: $skip, integrationId: $integrationId, searchValue: $searchValue) {
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
  query cloudflareCallsHistoriesTotalCount($limit: Int, $callStatus: String, $callType: String, $startDate: String, $endDate: String, $integrationId: String, $searchValue: String, $skip: Int) {
    cloudflareCallsHistoriesTotalCount(limit: $limit, callStatus: $callStatus, callType: $callType, startDate: $startDate, endDate: $endDate, integrationId: $integrationId, searchValue: $searchValue, skip: $skip)
  }
`;

const callsGetConfigs = `
  query cloudflareCallsGetConfigs {
    cloudflareCallsGetConfigs
  }
`;

export default {
  callsIntegrationDetail,
  callUserIntegrations,
  callCustomerDetail,
  callHistoriesTotalCount,
  customers,
  callHistories,
  callsGetConfigs,
};
