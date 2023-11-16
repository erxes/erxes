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

const callIntegrationsOfUser: any = `
  query callIntegrationsOfUser {
    callIntegrationsOfUser {
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
export default {
  callsIntegrationDetail,
  callIntegrationsOfUser,
  callCustomerDetail,
  customers
};
