import { gql } from '@apollo/client';

export const SCORE_LOGS_QUERY = gql`
  query ScoreLogs(
    $searchValue: String
    $campaignId: String
    $ownerType: String
    $ownerId: String
    $status: String
    $action: String
    $orderType: String
    $fromDate: String
    $toDate: String
    $boardId: String
    $pipelineId: String
    $stageId: String
    $number: String
    $description: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
  ) {
    scoreLogs(
      searchValue: $searchValue
      campaignId: $campaignId
      ownerType: $ownerType
      ownerId: $ownerId
      status: $status
      action: $action
      orderType: $orderType
      fromDate: $fromDate
      toDate: $toDate
      boardId: $boardId
      pipelineId: $pipelineId
      stageId: $stageId
      number: $number
      description: $description
      limit: $limit
      cursor: $cursor
      direction: $direction
    ) {
      list {
        _id
        ownerId
        ownerType
        owner
        totalScore
        change
        action
        description
        breakdown
        campaignId
        campaign {
          _id
          title
        }
        targetId
        target
        serviceName
        createdBy
        createdAt
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

export const SCORE_LOG_STATISTICS_QUERY = gql`
  query ScoreLogStatistics(
    $searchValue: String
    $campaignId: String
    $ownerType: String
    $ownerId: String
    $status: String
    $action: String
    $fromDate: String
    $toDate: String
    $boardId: String
    $pipelineId: String
    $stageId: String
    $number: String
    $description: String
  ) {
    scoreLogStatistics(
      searchValue: $searchValue
      campaignId: $campaignId
      ownerType: $ownerType
      ownerId: $ownerId
      status: $status
      action: $action
      fromDate: $fromDate
      toDate: $toDate
      boardId: $boardId
      pipelineId: $pipelineId
      stageId: $stageId
      number: $number
      description: $description
    )
  }
`;

export const SCORE_CAMPAIGNS_SIMPLE_QUERY = gql`
  query ScoreCampaignsSimple(
    $searchValue: String
    $limit: Int
    $status: String
  ) {
    scoreCampaigns(searchValue: $searchValue, limit: $limit, status: $status) {
      list {
        _id
        title
        ownerType
      }
    }
  }
`;

// Everything one record (a deal, an order) moved, whoever owned the points.
export const LOYALTY_TARGET_SCORE_LOGS = gql`
  query LoyaltyTargetScoreLogs($targetId: String) {
    scoreLogs(targetId: $targetId, limit: 100) {
      list {
        _id
        ownerId
        ownerType
        owner
        change
        action
        description
        createdAt
        campaign {
          _id
          title
        }
      }
    }
  }
`;
