export const commonMutationVariables = `
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
  $customFieldsData: JSON
`;

export const commonMutationParams = `
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
  companies
  customers
  assignedUsers
  labels
  stage
  isComplete
  isWatched
  relations
  startDate
  closeDate
  modifiedAt
  priority
  hasNotified
  score
  number
`;

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
  startDate
  closeDate
  description
  priority
  assignedUsers
  labels {
    _id
    name
    colorCode
  }
  labelIds
  stage {
    probability
  }
  isWatched
  attachments {
    name
    url
    type
    size
  }
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
`;

const stagesUpdateOrder = `
  mutation stagesUpdateOrder($orders: [OrderItem]) {
    stagesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const pipelinesWatch = `
  mutation pipelinesWatch($_id: String!, $isAdd: Boolean, $type: String!) {
    pipelinesWatch(_id: $_id, isAdd: $isAdd, type: $type) {
      _id
      isWatched
    }
  }
`;

const pipelineLabelsAdd = `
  mutation pipelineLabelsAdd($name: String!, $colorCode: String!, $pipelineId: String!) {
    pipelineLabelsAdd(name: $name, colorCode: $colorCode, pipelineId: $pipelineId) {
      _id
    }
  }
`;

const pipelineLabelsEdit = `
  mutation pipelineLabelsEdit($_id: String!, $name: String!, $colorCode: String!, $pipelineId: String!) {
    pipelineLabelsEdit(_id: $_id, name: $name, colorCode: $colorCode, pipelineId: $pipelineId) {
      _id
    }
  }
`;

const pipelineLabelsRemove = `
  mutation pipelineLabelsRemove($_id: String!) {
    pipelineLabelsRemove(_id: $_id)
  }
`;

const pipelineLabelsLabel = `
  mutation pipelineLabelsLabel($pipelineId: String!, $targetId: String!, $labelIds: [String!]!) {
    pipelineLabelsLabel(pipelineId: $pipelineId, targetId: $targetId, labelIds: $labelIds)
  }
`;

const stagesEdit = `
  mutation stagesEdit($_id: String!, $type: String, $name: String, $status: String) {
    stagesEdit(_id: $_id, type: $type, name: $name, status: $status) {
      _id
    }
  }
`;

const stagesRemove = `
  mutation stagesRemove($_id: String!) {
    stagesRemove(_id: $_id)
  }
`;

const stagesSortItems = `
  mutation stagesSortItems($stageId: String!, $type: String, $proccessId: String, $sortType: String) {
    stagesSortItems(stageId: $stageId, type: $type, proccessId: $proccessId, sortType: $sortType)
  }
`;

const conversationConvertToCard = `
  mutation conversationConvertToCard($_id: String!, $type:String!, $stageId: String, $itemName:String, $itemId:String $bookingProductId: String){
    conversationConvertToCard(_id:$_id,type:$type,itemId:$itemId,stageId:$stageId,itemName:$itemName bookingProductId: $bookingProductId)
  }
`;

const boardItemUpdateTimeTracking = `
  mutation boardItemUpdateTimeTracking($_id: String!, $type: String!, $status: String!, $timeSpent: Int! $startDate: String) {
    boardItemUpdateTimeTracking(_id: $_id, type: $type, status: $status, timeSpent: $timeSpent, startDate: $startDate)
  }
`;

const boardItemsSaveForGanttTimeline = `
  mutation boardItemsSaveForGanttTimeline($items: JSON, $links: JSON, $type: String!) {
    boardItemsSaveForGanttTimeline(items: $items, links: $links, type: $type)
  }
`;

export default {
  stagesUpdateOrder,
  pipelinesWatch,
  pipelineLabelsLabel,
  pipelineLabelsAdd,
  pipelineLabelsEdit,
  pipelineLabelsRemove,
  stagesEdit,
  stagesRemove,
  stagesSortItems,
  conversationConvertToCard,
  boardItemUpdateTimeTracking,
  boardItemsSaveForGanttTimeline
};
