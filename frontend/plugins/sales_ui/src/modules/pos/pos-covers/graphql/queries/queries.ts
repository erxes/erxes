import { gql } from '@apollo/client';

export const posCovers = gql`
  query PosCovers(
    $startDate: Date
    $endDate: Date
    $userId: String
    $page: Int
    $perPage: Int
  ) {
    posCovers(
      startDate: $startDate
      endDate: $endDate
      userId: $userId
      page: $page
      perPage: $perPage
    ) {
      _id
      posToken
      status
      beginDate
      endDate
      description
      userId
      details {
        _id
        paidType
        paidSummary {
          _id
          kind
          kindOfVal
          value
          amount
        }
        paidDetail
      }
      createdAt
      createdBy
      modifiedAt
      modifiedBy
      note
      posName
      user {
        _id
        createdAt
        username
        email
        isActive

        links
        status
        chatStatus
        emailSignatures
        getNotificationByEmail

        onboardedPlugins
        groupIds
        permissionGroupIds

        isSubscribed
        isShowNotification
        propertiesData
        isOwner
        configs
        configsConstants

        departmentIds
        brandIds
        branchIds

        positionIds

        score
        leaderBoardPosition
        employeeId
        isOnboarded
        cursor
      }
    }
  }
`;
