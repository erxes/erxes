import { gql } from '~/gql';

export const ADD_DEALS = gql(`
  mutation dealsAdd(
    $name: String
    $companyId: String
    $customerId: String
    $labelIds: [String]
    $productsData: JSON
    $mobileAmount: Float
    $mobileAmounts: JSON
    $paymentsData: JSON
    $extraData: JSON
    $brokerType: String
    $brokerId: String
    $parentId: String
    $processId: String
    $aboveItemId: String
    $stageId: String
    $startDate: Date
    $closeDate: Date
    $description: String
    $assignedUserIds: [String]
    $order: Int
    $attachments: [AttachmentInput]
    $reminderMinute: Int
    $isComplete: Boolean
    $status: String
    $priority: String
    $sourceConversationIds: [String]
    $propertiesData: JSON
    $tagIds: [String]
    $branchIds: [String]
    $departmentIds: [String]
  ) {
    dealsAdd(
      name: $name
      companyId: $companyId
      customerId: $customerId
      labelIds: $labelIds
      productsData: $productsData
      mobileAmount: $mobileAmount
      mobileAmounts: $mobileAmounts
      paymentsData: $paymentsData
      extraData: $extraData
      brokerType: $brokerType
      brokerId: $brokerId
      parentId: $parentId
      processId: $processId
      aboveItemId: $aboveItemId
      stageId: $stageId
      startDate: $startDate
      closeDate: $closeDate
      description: $description
      assignedUserIds: $assignedUserIds
      order: $order
      attachments: $attachments
      reminderMinute: $reminderMinute
      isComplete: $isComplete
      status: $status
      priority: $priority
      sourceConversationIds: $sourceConversationIds
      propertiesData: $propertiesData
      tagIds: $tagIds
      branchIds: $branchIds
      departmentIds: $departmentIds
    ) {
      _id
      name
    }
  }
`);

export const EDIT_DEALS = gql(`
  mutation dealsEdit(
    $_id: String!
    $name: String
    $productsData: JSON
    $mobileAmount: Float
    $mobileAmounts: JSON
    $paymentsData: JSON
    $extraData: JSON
    $brokerType: String
    $brokerId: String
    $parentId: String
    $processId: String
    $aboveItemId: String
    $stageId: String
    $startDate: Date
    $closeDate: Date
    $description: String
    $assignedUserIds: [String]
    $order: Int
    $attachments: [AttachmentInput]
    $reminderMinute: Int
    $isComplete: Boolean
    $status: String
    $priority: String
    $sourceConversationIds: [String]
    $propertiesData: JSON
    $tagIds: [String]
    $branchIds: [String]
    $departmentIds: [String]
    $customerId: String
    $companyId: String
  ) {
    dealsEdit(
      _id: $_id
      name: $name
      productsData: $productsData
      mobileAmount: $mobileAmount
      mobileAmounts: $mobileAmounts
      paymentsData: $paymentsData
      extraData: $extraData
      brokerType: $brokerType
      brokerId: $brokerId
      parentId: $parentId
      processId: $processId
      aboveItemId: $aboveItemId
      stageId: $stageId
      startDate: $startDate
      closeDate: $closeDate
      description: $description
      assignedUserIds: $assignedUserIds
      order: $order
      attachments: $attachments
      reminderMinute: $reminderMinute
      isComplete: $isComplete
      status: $status
      priority: $priority
      sourceConversationIds: $sourceConversationIds
      propertiesData: $propertiesData
      tagIds: $tagIds
      branchIds: $branchIds
      departmentIds: $departmentIds
      customerId: $customerId
      companyId: $companyId
    ) {
      _id
      name
      stageId
      hasNotified
      pipeline {
        _id
        name
        boardId
        tagId
        isCheckDate
        paymentIds
        paymentTypes
        tag {
          order
        }
      }
      boardId
      companies {
        _id
        primaryName
        links
      }
      customers {
        _id
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
        visitorContactInfo
      }
      tags {
        _id
        name
        colorCode
      }
      tagIds
      startDate
      closeDate
      description
      priority
      assignedUserIds
      assignedUsers {
        _id
        username
        email
        isActive
        details {
          avatar
          fullName
        }
      }
      labels {
        _id
        name
        colorCode
      }
      labelIds
      stage {
        _id
        probability
        type
        defaultTick
      }
      isWatched
      attachments {
        name
        url
        type
        size
      }
      createdAt
      modifiedAt
      modifiedBy
      reminderMinute
      isComplete
      status
      createdUser {
        _id
        details {
          fullName
          avatar
        }
      }
      order
      propertiesData
      score
      timeTrack {
        status
        timeSpent
        startDate
      }
      number
      customProperties
      branchIds
      departmentIds
      products {
        _id
        name
        unitPrice
      }
      productsData
      mobileAmount
      mobileAmounts
      paymentsData
      unUsedAmount
      amount
      brokerType
      brokerId
      stageId
    }
  }
`);

export const REMOVE_DEALS = gql(`
  mutation dealsRemove($_id: String!) {
    dealsRemove(_id: $_id) {
      _id
    }
  }
`);

export const DEALS_CHANGE = gql(`
  mutation dealsChange(
    $itemId: String!
    $aboveItemId: String
    $destinationStageId: String!
    $sourceStageId: String
    $processId: String
  ) {
    dealsChange(
      itemId: $itemId
      aboveItemId: $aboveItemId
      destinationStageId: $destinationStageId
      sourceStageId: $sourceStageId
      processId: $processId
    ) {
      _id
      name
      stageId
      hasNotified
      pipeline {
        _id
        name
        boardId
        tagId
        isCheckDate
        paymentIds
        paymentTypes
        tag {
          order
        }
      }
      boardId
      companies {
        _id
        primaryName
        links
      }
      customers {
        _id
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
        visitorContactInfo
      }
      tags {
        _id
        name
        colorCode
      }
      tagIds
      startDate
      closeDate
      description
      priority
      assignedUserIds
      assignedUsers {
        _id
        username
        email
        isActive
        details {
          avatar
          fullName
        }
      }
      labels {
        _id
        name
        colorCode
      }
      labelIds
      stage {
        _id
        probability
        type
        defaultTick
      }
      isWatched
      attachments {
        name
        url
        type
        size
      }
      createdAt
      modifiedAt
      modifiedBy
      reminderMinute
      isComplete
      status
      createdUser {
        _id
        details {
          fullName
          avatar
        }
      }
      order
      propertiesData
      score
      timeTrack {
        status
        timeSpent
        startDate
      }
      number
      customProperties
      branchIds
      departmentIds
      products {
        _id
        name
        unitPrice
      }
      productsData
      mobileAmount
      mobileAmounts
      paymentsData
      unUsedAmount
      amount
      brokerType
      brokerId
      stageId
    }
  }
`);

export const DEALS_WATCH = gql(`
  mutation dealsWatch($_id: String!, $isAdd: Boolean!) {
    dealsWatch(_id: $_id, isAdd: $isAdd) {
      __typename
      _id
      isWatched
    }
  }
`);

export const DEALS_ARCHIVE = gql(`
  mutation dealsArchive($stageId: String!, $processId: String) {
    dealsArchive(stageId: $stageId, processId: $processId)
  }
`);

export const DEALS_COPY = gql(`
  mutation dealsCopy($_id: String!, $processId: String) {
    dealsCopy(_id: $_id, processId: $processId) {
      _id
      name
      stageId
      hasNotified
      pipeline {
        _id
        name
        boardId
        tagId
        isCheckDate
        paymentIds
        paymentTypes
        tag {
          order
        }
      }
      boardId
      companies {
        _id
        primaryName
        links
      }
      customers {
        _id
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
        visitorContactInfo
      }
      tags {
        _id
        name
        colorCode
      }
      tagIds
      startDate
      closeDate
      description
      priority
      assignedUserIds
      assignedUsers {
        _id
        username
        email
        isActive
        details {
          avatar
          fullName
        }
      }
      labels {
        _id
        name
        colorCode
      }
      labelIds
      stage {
        _id
        probability
        type
        defaultTick
      }
      isWatched
      attachments {
        name
        url
        type
        size
      }
      createdAt
      modifiedAt
      modifiedBy
      reminderMinute
      isComplete
      status
      createdUser {
        _id
        details {
          fullName
          avatar
        }
      }
      order
      propertiesData
      score
      timeTrack {
        status
        timeSpent
        startDate
      }
      number
      customProperties
      branchIds
      departmentIds
      products {
        _id
        name
        unitPrice
      }
      productsData
      mobileAmount
      mobileAmounts
      paymentsData
      unUsedAmount
      amount
      brokerType
      brokerId
      stageId
    }
  }
`);
