import { gql } from '@apollo/client';

export const ACCOUNTING_CHECK_SYNCED_ORDERS_QUERY = gql`
  query AccountingCheckSyncedOrders(
    $perPage: Int
    $page: Int
    $sortField: String
    $sortDirection: Int
    $search: String
    $posId: String
    $paidStartDate: Date
    $paidEndDate: Date
    $createdStartDate: Date
    $createdEndDate: Date
  ) {
    posOrders(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      search: $search
      posId: $posId
      paidStartDate: $paidStartDate
      paidEndDate: $paidEndDate
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
    ) {
      _id
      createdAt
      paidDate
      number
      totalAmount
    }
    posOrdersTotalCount(
      search: $search
      posId: $posId
      paidStartDate: $paidStartDate
      paidEndDate: $paidEndDate
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
    )
  }
`;

export const ACCOUNTING_SYNC_ORDER_RULES_QUERY = gql`
  query AccountingSyncOrderRules($code: String!) {
    accountingsConfigs(code: $code) {
      _id
      code
      subId
      value
    }
  }
`;

export const ACCOUNTING_CHECK_SYNCED_ORDERS_MUTATION = gql`
  mutation AccountingCheckSyncedOrders($ids: [String], $contentType: String) {
    accountingCheckSynced(ids: $ids, contentType: $contentType) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`;

export const ACCOUNTING_POS_LIST_QUERY = gql`
  query AccountingPosList($page: Int, $perPage: Int) {
    posList(page: $page, perPage: $perPage) {
      _id
      name
    }
  }
`;

export const ACCOUNTING_SYNC_ORDERS_MUTATION = gql`
  mutation AccountingSyncOrders($orderIds: [String], $ruleId: String) {
    accountingSyncOrders(orderIds: $orderIds, ruleId: $ruleId) {
      skipped
      error
      success
    }
  }
`;
