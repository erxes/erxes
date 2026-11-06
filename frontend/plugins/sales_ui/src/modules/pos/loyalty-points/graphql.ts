import { gql } from '~/gql';

export const SALES_POS_SCORE_LOGS = gql(`
  query SalesPosScoreLogs(
    $page: Int
    $perPage: Int
    $kind: SalesScoreLogKind
    $period: SalesScoreLogPeriod
    $orderIds: [String]
    $branchIds: [String]
    $search: String
    $userId: String
    $customerId: String
    $posIds: [String]
  ) {
    salesPosScoreLogs(
      page: $page
      perPage: $perPage
      kind: $kind
      period: $period
      orderIds: $orderIds
      branchIds: $branchIds
      search: $search
      userId: $userId
      customerId: $customerId
      posIds: $posIds
    ) {
      list {
        orderId
        orderNumber
        posId
        posName
        branchId
        scoreLogId
      }
      totalCount
    }
  }
`);

export const SALES_POS_SCORE_LOG_INSIGHTS = gql(`
  query SalesPosScoreLogInsights(
    $search: String
    $userId: String
    $customerId: String
    $posIds: [String]
  ) {
    salesPosScoreLogInsights(
      search: $search
      userId: $userId
      customerId: $customerId
      posIds: $posIds
    ) {
      totals {
        action
        total
        count
      }
      entryCount
      recalculatedEarned
      recalculatedSpent
      net
      orderCount
      customerCount
      byPos {
        posId
        posName
        earned
        spent
        refunded
        other
        recalculated
        net
      }
      topOrders {
        orderId
        orderNumber
        posName
        earned
        net
      }
      byCashier {
        id
        earned
        spent
        refunded
        net
      }
      byBranch {
        id
        earned
        spent
        refunded
        net
      }
      topEarners {
        id
        earned
        spent
        refunded
        net
      }
      topSpenders {
        id
        earned
        spent
        refunded
        net
      }
    }
  }
`);

export const SALES_POS_SCORE_LOG_TIMELINE = gql(`
  query SalesPosScoreLogTimeline(
    $interval: SalesDealScoreLogInterval!
    $timezone: String
    $search: String
    $userId: String
    $customerId: String
    $posIds: [String]
  ) {
    salesPosScoreLogTimeline(
      interval: $interval
      timezone: $timezone
      search: $search
      userId: $userId
      customerId: $customerId
      posIds: $posIds
    ) {
      interval
      buckets {
        key
        earned
        spent
        refunded
        other
        recalculated
        net
        cumulative
      }
    }
  }
`);
