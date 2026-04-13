import { gql } from '@apollo/client';

export const SCORE_LOG_LIST_QUERY = gql`
  query ScoreLogList(
    $searchValue: String
    $campaignId: String
    $ownerType: String
    $ownerId: String
    $status: String
    $action: String
    $orderType: String
    $fromDate: String
    $toDate: String
    $stageId: String
    $number: String
    $description: String
  ) {
    scoreLogList(
      searchValue: $searchValue
      campaignId: $campaignId
      ownerType: $ownerType
      ownerId: $ownerId
      status: $status
      action: $action
      orderType: $orderType
      fromDate: $fromDate
      toDate: $toDate
      stageId: $stageId
      number: $number
      description: $description
    ) {
      list {
        ownerId
        ownerType
        owner
        logs {
          _id
          ownerId
          ownerType
          change
          action
          description
          campaignId
          campaign {
            _id
            title
            description
            add
            subtract
            createdAt
            createdUserId
            status
            ownerType
            fieldGroupId
            fieldName
            fieldId
            fieldOrigin
            serviceName
            additionalConfig
            restrictions
            onlyClientPortal
          }
          targetId
          target
          serviceName
          createdBy
          createdAt
          amount
          quantity
        }
        totalScore
      }
      total
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
    $stageId: String
    $number: String
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
      stageId: $stageId
      number: $number
    )
  }
`;

export const SCORE_CAMPAIGNS_SIMPLE_QUERY = gql`
  query ScoreCampaignsSimple($searchValue: String, $limit: Int) {
    scoreCampaigns(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        title
        ownerType
      }
    }
  }
`;
