export const commonMutationVariables = `
  $stageId: String,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
  $attachments: [AttachmentInput],
  $reminderMinute: Int,
  $isComplete: Boolean,
  $status: String,
  $priority: String,
  $sourceConversationId: String,
`;

export const commonMutationParams = `
  stageId: $stageId,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  attachments: $attachments,
  reminderMinute: $reminderMinute,
  isComplete: $isComplete,
  status: $status,
  priority: $priority,
  sourceConversationId: $sourceConversationId,
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
    website
  }
  customers {
    _id
    firstName
    lastName
    primaryEmail
    primaryPhone
    visitorContactInfo
  }
  closeDate
  description
  priority
  assignedUsers {
    _id
    email
    details {
      fullName
      avatar
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

export default {
  stagesUpdateOrder,
  pipelinesWatch,
  pipelineLabelsLabel,
  pipelineLabelsAdd,
  pipelineLabelsEdit,
  pipelineLabelsRemove,
  stagesEdit,
  stagesRemove
};
