import { gql } from '~/gql';

export const DEAL_LIST_CHANGED = gql(`
subscription salesDealListChanged($pipelineId: String!, $userId: String, $filter: IDealFilter) {
  salesDealListChanged(pipelineId: $pipelineId, userId: $userId, filter: $filter) {
    action
    deal {
      products {
        _id
        name
      }
      productsData
      unUsedAmount
      amount
      _id
      name
      companies {
        _id
        primaryName
        primaryPhone
        primaryEmail
      }
      customers {
        _id
        firstName
        middleName
        lastName
        primaryPhone
        primaryEmail
        phones
        emails
      }
      assignedUsers {
        _id
        details {
          avatar
          fullName
        }
      }
      assignedUserIds
      labels {
        _id
        name
        colorCode
      }
      stage {
        _id
        name
        pipelineId
        defaultTick
        age
      }
      stageId
      pipelineId
      order
      isComplete
      isWatched
      relations
      startDate
      closeDate
      createdAt
      modifiedAt
      priority
      hasNotified
      score
      number
      tagIds
      customProperties
      propertiesData
      status
      tags {
        _id
        name
        colorCode
      }
      branchIds
      departmentIds
      departments {
        _id
        title
      }
      branches {
        _id
        title
      }
      relations
      pipeline {
        _id
        name
        boardId
      }
      boardId
    }
  }
}
`);
