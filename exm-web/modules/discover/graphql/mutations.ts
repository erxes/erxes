import { gql } from "@apollo/client"
import { queries as teamQueries } from "common/team/graphql"

const detailFields = teamQueries.detailFields
const allUsers = teamQueries.allUsers
const users = teamQueries.users

const ticketFields = `
  source
`

const commonFields = `
  _id
  name
  stageId
  hasNotified
  pipeline {
    _id
    name
    tagId
      tag {
        order
      }
  }
  boardId
  
    ... @defer {
      companies {
        _id
        primaryName
        links
      }
    }

  }

    ... @defer {
      customers {
        _id
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
        visitorContactInfo
      }
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

const ticketsAdd = `
  mutation ticketsAdd($name: String!, ${copyVariables}, ${ticketMutationVariables}, ${commonMutationVariables}) {
    ticketsAdd(name: $name, ${copyParams}, ${ticketMutationParams}, ${commonMutationParams}) {
      ${ticketFields}
      ${commonFields}
    }
  }
`

export default {
  ticketsAdd,
}
