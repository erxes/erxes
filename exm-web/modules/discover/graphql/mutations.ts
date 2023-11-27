import { gql } from "@apollo/client"

export const ticketFields = `
  source
`

export const commonFields = `
  _id
  name
  stageId
  hasNotified
  pipeline {
    _id
    name
  }
  boardId
  tagIds
  startDate
  closeDate
  description
  priority
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
  customFieldsData
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
`

const commonMutationVariables = `
  $parentId: String,
  $proccessId: String,
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
  $customFieldsData: JSON,
  $tagIds: [String]
  $branchIds:[String],
  $departmentIds:[String]
`

const commonMutationParams = `
  parentId: $parentId,
  proccessId: $proccessId,
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
  customFieldsData: $customFieldsData,
  tagIds: $tagIds
  branchIds: $branchIds
  departmentIds: $departmentIds
`

const ticketMutationVariables = `
  $source: String,
`

const ticketMutationParams = `
  source: $source,
`

const copyVariables = `$customerIds: [String], $companyIds: [String], $labelIds: [String]`
const copyParams = `customerIds: $customerIds, companyIds: $companyIds, labelIds: $labelIds`

const ticketsAdd = gql`
  mutation ticketsAdd($name: String!, ${copyVariables}, ${ticketMutationVariables}, ${commonMutationVariables}) {
    ticketsAdd(name: $name, ${copyParams}, ${ticketMutationParams}, ${commonMutationParams}) {
      ${ticketFields}
    }
  }
`

export default {
  ticketsAdd,
}
