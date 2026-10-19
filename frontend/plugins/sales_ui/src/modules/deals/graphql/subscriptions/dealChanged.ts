import { gql } from '~/gql';

export const DEAL_CHANGED = gql(`
subscription salesDealChanged($_id: String!) {
  salesDealChanged(_id: $_id) {
    action
    deal {
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
      description
      extraData
      attachments {
        url
        name
        duration
        size
        type
      }
      departments {
        _id
        title
      }
      departmentIds
      branches {
        _id
        title
      }
      branchIds
      companies {
        _id
        primaryName
      }
      customers {
        _id
        firstName
        lastName
        email
      }
      products {
        _id
        name
        code
        type
        unitPrice
        uom
        subUoms
        category {
          _id
          name
        }
        vendor {
          _id
          primaryName
        }
        categoryId
      }
      productsData
      mobileAmount
      mobileAmounts
      paymentsData
      brokerType
      brokerId
      relations
      pipeline {
        _id
        name
        boardId
        paymentTypes
        paymentIds
      }
      boardId
    }
  }
}
`);
