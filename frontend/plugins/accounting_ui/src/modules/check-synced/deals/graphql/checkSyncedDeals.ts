import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS } from 'erxes-ui';

export const ACCOUNTING_CHECK_SYNCED_DEALS_QUERY = gql`
  query AccountingCheckSyncedDeals(
    ${GQL_CURSOR_PARAM_DEFS}
    $userIds: [String]
    $stageId: String
    $startDate: String
    $endDate: String
    $search: String
    $number: String
    $noSkipArchive: Boolean
  ) {
    deals(
      ${GQL_CURSOR_PARAMS}
      userIds: $userIds
      stageId: $stageId
      startDate: $startDate
      endDate: $endDate
      search: $search
      number: $number
      noSkipArchive: $noSkipArchive
    ) {
      list {
        _id
        name
        amount
        number
        createdAt
        stageChangedDate
        modifiedAt
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const ACCOUNTING_SALES_BOARDS_QUERY = gql`
  query AccountingSalesBoards {
    salesBoards {
      _id
      name
    }
  }
`;

export const ACCOUNTING_SALES_PIPELINES_QUERY = gql`
  query AccountingSalesPipelines($boardId: String) {
    salesPipelines(boardId: $boardId) {
      list {
        _id
        name
      }
    }
  }
`;

export const ACCOUNTING_SALES_STAGES_QUERY = gql`
  query AccountingSalesStages($pipelineId: String!) {
    salesStages(pipelineId: $pipelineId) {
      _id
      name
    }
  }
`;

export const ACCOUNTING_SYNC_DEAL_RULES_QUERY = gql`
  query AccountingSyncDealRules($saleCode: String!, $returnCode: String!) {
    saleRules: accountingsConfigs(code: $saleCode) {
      _id
      code
      subId
      value
    }
    returnRules: accountingsConfigs(code: $returnCode) {
      _id
      code
      subId
      value
    }
  }
`;

export const ACCOUNTING_CHECK_SYNCED_MUTATION = gql`
  mutation AccountingCheckSynced($ids: [String], $contentType: String) {
    accountingCheckSynced(ids: $ids, contentType: $contentType) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`;

export const ACCOUNTING_SYNC_DEALS_MUTATION = gql`
  mutation AccountingSyncDeals(
    $dealIds: [String]
    $ruleId: String
    $dateType: String
  ) {
    accountingSyncDeals(
      dealIds: $dealIds
      ruleId: $ruleId
      dateType: $dateType
    ) {
      skipped
      error
      success
    }
  }
`;
