import { isEnabled } from '@erxes/ui/src/utils/core';

const createTicketComment = `
  mutation createTicketComment(
    $ticketId: String!
    $content: String!
  ) {
    createTicketComment(
      ticketId: $ticketId
      content: $content
    ) {
      _id
    }
  }
`;

export const commonMutationVariables = `
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
`;

export const commonMutationParams = `
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
`;

export const commonDragVariables = `
  $itemId: String!,
  $aboveItemId: String,
  $destinationStageId: String!,
  $sourceStageId: String,
  $proccessId: String
`;

export const commonDragParams = `
  itemId: $itemId,
  aboveItemId: $aboveItemId,
  destinationStageId: $destinationStageId,
  sourceStageId: $sourceStageId,
  proccessId: $proccessId
`;

export const commonListFields = `
  _id
  name
  ${isEnabled('contacts') ? `companies` : ``}
  ${isEnabled('contacts') ? `customers` : ``}
  assignedUsers
  labels
  stage
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
  status
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

    ${
      isEnabled('tags')
        ? `
        tag {
          order
        }
    `
        : ``
    }
  }
  boardId
  ${
    isEnabled('contacts')
      ? `
    ... @defer {
      companies {
        _id
        primaryName
        links
      }
    }
  `
      : ``
  }
  ${
    isEnabled('contacts')
      ? `
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
  `
      : ``
  }
  ${
    isEnabled('tags')
      ? `
  tags {
    _id
    name
    colorCode
  }
  `
      : ``
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
`;

const pipelinesWatch = `
  mutation dealPipelinesWatch($_id: String!, $isAdd: Boolean, $type: String!) {
    dealPipelinesWatch(_id: $_id, isAdd: $isAdd, type: $type) {
      _id
      isWatched
    }
  }
`;

const stagesEdit = `
  mutation dealStagesEdit($_id: String!, $type: String, $name: String, $status: String) {
    dealStagesEdit(_id: $_id, type: $type, name: $name, status: $status) {
      _id
    }
  }
`;

const stagesRemove = `
  mutation dealStagesRemove($_id: String!) {
    dealStagesRemove(_id: $_id)
  }
`;

const boardItemUpdateTimeTracking = `
  mutation dealBoardItemUpdateTimeTracking($_id: String!, $type: String!, $status: String!, $timeSpent: Int! $startDate: String) {
    dealBoardItemUpdateTimeTracking(_id: $_id, type: $type, status: $status, timeSpent: $timeSpent, startDate: $startDate)
  }
`;

const stagesSortItems = `
  mutation dealStagesSortItems($stageId: String!, $type: String, $proccessId: String, $sortType: String) {
    dealStagesSortItems(stageId: $stageId, type: $type, proccessId: $proccessId, sortType: $sortType)
  }
`;

const pipelineLabelsAdd = `
  mutation dealPipelineLabelsAdd($name: String!, $colorCode: String!, $pipelineId: String!) {
    dealPipelineLabelsAdd(name: $name, colorCode: $colorCode, pipelineId: $pipelineId) {
      _id
    }
  }
`;

const pipelineLabelsEdit = `
  mutation dealPipelineLabelsEdit($_id: String!, $name: String!, $colorCode: String!, $pipelineId: String!) {
    dealPipelineLabelsEdit(_id: $_id, name: $name, colorCode: $colorCode, pipelineId: $pipelineId) {
      _id
    }
  }
`;

const pipelineLabelsRemove = `
  mutation dealPipelineLabelsRemove($_id: String!) {
    dealPipelineLabelsRemove(_id: $_id)
  }
`;

const pipelineLabelsLabel = `
  mutation dealPipelineLabelsLabel($pipelineId: String!, $targetId: String!, $labelIds: [String!]!) {
    dealPipelineLabelsLabel(pipelineId: $pipelineId, targetId: $targetId, labelIds: $labelIds)
  }
`;

const boardItemsSaveForGanttTimeline = `
  mutation dealBoardItemsSaveForGanttTimeline($items: JSON, $links: JSON, $type: String!) {
    dealBoardItemsSaveForGanttTimeline(items: $items, links: $links, type: $type)
  }
`;

const stagesUpdateOrder = `
  mutation dealStagesUpdateOrder($orders: [OrderItem]) {
    dealStagesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const conversationConvertToCard = `
mutation conversationConvertToCard(
  $_id: String!
  $type: String!
  $assignedUserIds: [String]
  $attachments: [AttachmentInput]
  $bookingProductId: String
  $closeDate: Date
  $customFieldsData: JSON
  $description: String
  $itemId: String
  $itemName: String
  $labelIds: [String]
  $priority: String
  $stageId: String
  $startDate: Date
) {
  conversationConvertToCard(
    _id: $_id
    type: $type
    assignedUserIds: $assignedUserIds
    attachments: $attachments
    bookingProductId: $bookingProductId
    closeDate: $closeDate
    customFieldsData: $customFieldsData
    description: $description
    itemId: $itemId
    itemName: $itemName
    labelIds: $labelIds
    priority: $priority
    stageId: $stageId
    startDate: $startDate
  )
}
`;

export default {
  createTicketComment,
  pipelinesWatch,
  stagesEdit,
  stagesRemove,
  boardItemUpdateTimeTracking,
  stagesSortItems,
  pipelineLabelsAdd,
  pipelineLabelsEdit,
  pipelineLabelsRemove,
  pipelineLabelsLabel,
  boardItemsSaveForGanttTimeline,
  stagesUpdateOrder,
  conversationConvertToCard,
};
