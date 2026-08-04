import { gql } from '@apollo/client';

export const POS_COVER_DETAIL_QUERY = gql`
  query PosCoverDetail($id: String!) {
    posCoverDetail(_id: $id) {
      _id
      posToken
      beginDate
      endDate
      status
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
