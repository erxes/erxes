import { dealFields } from './queries';

const commonVariables = `
  $stageId: String,
  $productsData: JSON,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
  $attachments: [AttachmentInput],
  $reminderMinute: Int,
  $isComplete: Boolean,
  $priority: String,
  $sourceConversationId: String,
`;

const commonParams = `
  stageId: $stageId,
  productsData: $productsData,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  attachments: $attachments,
  reminderMinute: $reminderMinute,
  isComplete: $isComplete,
  priority: $priority,
  sourceConversationId: $sourceConversationId,
`;

const copyVariables = `$companyIds: [String], $customerIds: [String], $labelIds: [String]`;
const copyParams = `companyIds: $companyIds, customerIds: $customerIds, labelIds: $labelIds`;

const dealsAdd = `
  mutation dealsAdd($name: String!, ${copyVariables}, ${commonVariables}) {
    dealsAdd(name: $name, ${copyParams}, ${commonParams}) {
      ${dealFields}
    }
  }
`;

const dealsEdit = `
  mutation dealsEdit($_id: String!, $name: String, ${commonVariables}) {
    dealsEdit(_id: $_id, name: $name, ${commonParams}) {
      ${dealFields}
    }
  }
`;

const dealsRemove = `
  mutation dealsRemove($_id: String!) {
    dealsRemove(_id: $_id) {
      _id
    }
  }
`;

const dealsChange = `
  mutation dealsChange($_id: String!, $destinationStageId: String!) {
    dealsChange(_id: $_id, destinationStageId: $destinationStageId) {
      _id
    }
  }
`;

const dealsUpdateOrder = `
  mutation dealsUpdateOrder($stageId: String!, $orders: [OrderItem]) {
    dealsUpdateOrder(stageId: $stageId, orders: $orders) {
      _id
    }
  }
`;

const dealsWatch = `
  mutation dealsWatch($_id: String!, $isAdd: Boolean!) {
    dealsWatch(_id: $_id, isAdd: $isAdd) {
      _id
      isWatched
    }
  }
`;

const dealsCopy = `
  mutation dealsCopy($_id: String!) {
    dealsCopy(_id: $_id) {
      ${dealFields}
    }
  }
`;

export default {
  dealsAdd,
  dealsEdit,
  dealsRemove,
  dealsChange,
  dealsUpdateOrder,
  dealsWatch,
  dealsCopy
};
