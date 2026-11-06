import { gql } from '~/gql';

export const SALES_DEAL_SCORE_LOGS = gql(`
  query SalesDealScoreLogs(
    $page: Int
    $perPage: Int
    $kind: SalesScoreLogKind
    $period: SalesScoreLogPeriod
    $stageId: String
    $_ids: [String]
    $companyId: String
    $customerId: String
    $assignedUserIds: [String]
    $productIds: [String]
    $labelIds: [String]
    $search: String
    $number: String
    $priority: [String]
    $pipelineId: String
    $pipelineIds: [String]
    $boardIds: [String]
    $closeDateType: String
    $userIds: [String]
    $segment: String
    $assignedToMe: String
    $tagIds: [String]
    $branchIds: [String]
    $departmentIds: [String]
    $createdStartDate: Date
    $createdEndDate: Date
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDateStartDate: Date
    $startDateEndDate: Date
    $closeDateStartDate: Date
    $closeDateEndDate: Date
  ) {
    salesDealScoreLogs(
      page: $page
      perPage: $perPage
      kind: $kind
      period: $period
      stageId: $stageId
      _ids: $_ids
      companyId: $companyId
      customerId: $customerId
      assignedUserIds: $assignedUserIds
      productIds: $productIds
      labelIds: $labelIds
      search: $search
      number: $number
      priority: $priority
      pipelineId: $pipelineId
      pipelineIds: $pipelineIds
      boardIds: $boardIds
      closeDateType: $closeDateType
      userIds: $userIds
      segment: $segment
      assignedToMe: $assignedToMe
      tagIds: $tagIds
      branchIds: $branchIds
      departmentIds: $departmentIds
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      stageChangedStartDate: $stageChangedStartDate
      stageChangedEndDate: $stageChangedEndDate
      startDateStartDate: $startDateStartDate
      startDateEndDate: $startDateEndDate
      closeDateStartDate: $closeDateStartDate
      closeDateEndDate: $closeDateEndDate
    ) {
      list {
        dealId
        dealName
        stageId
        stageName
        pipelineName
        boardName
        scoreLogId
      }
      totalCount
    }
  }
`);

export const SALES_DEAL_SCORE_LOG_INSIGHTS = gql(`
  query SalesDealScoreLogInsights(
    $stageId: String
    $_ids: [String]
    $companyId: String
    $customerId: String
    $assignedUserIds: [String]
    $productIds: [String]
    $labelIds: [String]
    $search: String
    $number: String
    $priority: [String]
    $pipelineId: String
    $pipelineIds: [String]
    $boardIds: [String]
    $closeDateType: String
    $userIds: [String]
    $segment: String
    $assignedToMe: String
    $tagIds: [String]
    $branchIds: [String]
    $departmentIds: [String]
    $createdStartDate: Date
    $createdEndDate: Date
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDateStartDate: Date
    $startDateEndDate: Date
    $closeDateStartDate: Date
    $closeDateEndDate: Date
  ) {
    salesDealScoreLogInsights(
      stageId: $stageId
      _ids: $_ids
      companyId: $companyId
      customerId: $customerId
      assignedUserIds: $assignedUserIds
      productIds: $productIds
      labelIds: $labelIds
      search: $search
      number: $number
      priority: $priority
      pipelineId: $pipelineId
      pipelineIds: $pipelineIds
      boardIds: $boardIds
      closeDateType: $closeDateType
      userIds: $userIds
      segment: $segment
      assignedToMe: $assignedToMe
      tagIds: $tagIds
      branchIds: $branchIds
      departmentIds: $departmentIds
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      stageChangedStartDate: $stageChangedStartDate
      stageChangedEndDate: $stageChangedEndDate
      startDateStartDate: $startDateStartDate
      startDateEndDate: $startDateEndDate
      closeDateStartDate: $closeDateStartDate
      closeDateEndDate: $closeDateEndDate
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
      dealCount
      customerCount
      byPipeline {
        pipelineId
        pipelineName
        boardName
        earned
        spent
        refunded
        other
        recalculated
        net
      }
      topDeals {
        dealId
        dealName
        pipelineName
        earned
        net
      }
      byAssignee {
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

export const SALES_DEAL_SCORE_LOG_TIMELINE = gql(`
  query SalesDealScoreLogTimeline(
    $interval: SalesDealScoreLogInterval!
    $timezone: String
    $stageId: String
    $_ids: [String]
    $companyId: String
    $customerId: String
    $assignedUserIds: [String]
    $productIds: [String]
    $labelIds: [String]
    $search: String
    $number: String
    $priority: [String]
    $pipelineId: String
    $pipelineIds: [String]
    $boardIds: [String]
    $closeDateType: String
    $userIds: [String]
    $segment: String
    $assignedToMe: String
    $tagIds: [String]
    $branchIds: [String]
    $departmentIds: [String]
    $createdStartDate: Date
    $createdEndDate: Date
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDateStartDate: Date
    $startDateEndDate: Date
    $closeDateStartDate: Date
    $closeDateEndDate: Date
  ) {
    salesDealScoreLogTimeline(
      interval: $interval
      timezone: $timezone
      stageId: $stageId
      _ids: $_ids
      companyId: $companyId
      customerId: $customerId
      assignedUserIds: $assignedUserIds
      productIds: $productIds
      labelIds: $labelIds
      search: $search
      number: $number
      priority: $priority
      pipelineId: $pipelineId
      pipelineIds: $pipelineIds
      boardIds: $boardIds
      closeDateType: $closeDateType
      userIds: $userIds
      segment: $segment
      assignedToMe: $assignedToMe
      tagIds: $tagIds
      branchIds: $branchIds
      departmentIds: $departmentIds
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      stageChangedStartDate: $stageChangedStartDate
      stageChangedEndDate: $stageChangedEndDate
      startDateStartDate: $startDateStartDate
      startDateEndDate: $startDateEndDate
      closeDateStartDate: $closeDateStartDate
      closeDateEndDate: $closeDateEndDate
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
