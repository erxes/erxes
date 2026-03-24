import gql from "graphql-tag";

const dealMutationVariables = `
  $productsData: JSON,
  $paymentsData: JSON,
  $extraData: JSON,
`;

const dealMutationParams = `
  productsData: $productsData,
  paymentsData: $paymentsData,
  extraData: $extraData,
`;

const copyVariables = `$companyIds: [String], $customerIds: [String], $labelIds: [String]`;
const copyParams = `companyIds: $companyIds, customerIds: $customerIds, labelIds: $labelIds`;

export const dealFields = `
  products {
    _id
    name
    unitPrice
  }
  productsData
  paymentsData
  unUsedAmount
  amount
  stageId
`;

export const commonFields = `
  _id
  name
  stageId
  hasNotified
  pipeline {
    _id
    name
    tagId
    isCheckDate

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
`;

export const commonDragVariables = `
  $itemId: String!,
  $aboveItemId: String,
  $destinationStageId: String!,
  $sourceStageId: String,
  $processId: String
`;

export const commonDragParams = `
  itemId: $itemId,
  aboveItemId: $aboveItemId,
  destinationStageId: $destinationStageId,
  sourceStageId: $sourceStageId,
  processId: $processId
`;

export const commonMutationVariables = `
  $parentId: String,
  $processId: String,
  $aboveItemId: String,
  $stageId: String,
  $startDate: Date,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
  $attachments: [AttachmentInput],
  $reminderMinute: Int,
  $isComplete: Boolean,
  $status: String,
  $priority: String,
  $sourceConversationIds: [String],
  $propertiesData: JSON,
  $tagIds: [String]
  $branchIds:[String],
  $departmentIds:[String]
`;

export const commonMutationParams = `
  parentId: $parentId,
  processId: $processId,
  aboveItemId: $aboveItemId,
  stageId: $stageId,
  startDate: $startDate,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  attachments: $attachments,
  reminderMinute: $reminderMinute,
  isComplete: $isComplete,
  status: $status,
  priority: $priority,
  sourceConversationIds: $sourceConversationIds,
  propertiesData: $propertiesData,
  tagIds: $tagIds
  branchIds: $branchIds
  departmentIds: $departmentIds
`;


export const ADD_DEALS = gql`
  mutation dealsAdd($name: String, ${copyVariables}, ${dealMutationVariables} ${commonMutationVariables}) {
    dealsAdd(name: $name, ${copyParams}, ${dealMutationParams}, ${commonMutationParams}) {
      _id
      name
    }
  }
`;

export const EDIT_DEALS = gql`
  mutation dealsEdit($_id: String!, $name: String, ${dealMutationVariables}, ${commonMutationVariables}) {
    dealsEdit(_id: $_id, name: $name, ${dealMutationParams}, ${commonMutationParams}) {
      ${commonFields}
      ${dealFields}
    }
  }
`;

export const REMOVE_DEALS = gql`
  mutation dealsRemove($_id: String!) {
    dealsRemove(_id: $_id) {
      _id
    }
  }
`;

export const DEALS_CHANGE = gql`
  mutation dealsChange(${commonDragVariables}) {
    dealsChange(${commonDragParams}) {
      _id
    }
  }
`;

export const DEALS_WATCH = gql`
  mutation dealsWatch($_id: String!, $isAdd: Boolean!) {
    dealsWatch(_id: $_id, isAdd: $isAdd) {
      _id
      isWatched
    }
  }
`;

export const DEALS_ARCHIVE = gql`
  mutation dealsArchive($stageId: String!, $processId: String) {
    dealsArchive(stageId: $stageId, processId: $processId)
  }
`;

export const DEALS_COPY = gql`
  mutation dealsCopy($_id: String!, $processId: String) {
    dealsCopy(_id: $_id, processId: $processId) {
      ${commonFields}
      ${dealFields}
    }
  }
`;