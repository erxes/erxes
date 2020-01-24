import { taskFields } from './queries';

const commonVariables = `
  $stageId: String,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
  $priority: String,
  $attachments: [AttachmentInput],
  $reminderMinute: Int,
  $isComplete: Boolean,
  $sourceConversationId: String,
`;

const commonParams = `
  stageId: $stageId,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  priority: $priority,
  attachments: $attachments,
  reminderMinute: $reminderMinute,
  isComplete: $isComplete,
  sourceConversationId: $sourceConversationId,
`;

const copyVariables = `$companyIds: [String], $customerIds: [String], $labelIds: [String]`;
const copyParams = `companyIds: $companyIds, customerIds: $customerIds, labelIds: $labelIds`;

const tasksAdd = `
  mutation tasksAdd($name: String!, ${copyVariables}, ${commonVariables}) {
    tasksAdd(name: $name, ${copyParams}, ${commonParams}) {
      ${taskFields}
    }
  }
`;

const tasksEdit = `
  mutation tasksEdit($_id: String!, $name: String, ${commonVariables}) {
    tasksEdit(_id: $_id, name: $name, ${commonParams}) {
      ${taskFields}
    }
  }
`;

const tasksRemove = `
  mutation tasksRemove($_id: String!) {
    tasksRemove(_id: $_id) {
      _id
    }
  }
`;

const tasksChange = `
  mutation tasksChange($_id: String!, $destinationStageId: String!) {
    tasksChange(_id: $_id, destinationStageId: $destinationStageId) {
      _id
    }
  }
`;

const tasksUpdateOrder = `
  mutation tasksUpdateOrder($stageId: String!, $orders: [OrderItem]) {
    tasksUpdateOrder(stageId: $stageId, orders: $orders) {
      _id
    }
  }
`;

const tasksWatch = `
  mutation tasksWatch($_id: String!, $isAdd: Boolean!) {
    tasksWatch(_id: $_id, isAdd: $isAdd) {
      _id
      isWatched
    }
  }
`;

const tasksCopy = `
  mutation tasksCopy($_id: String!) {
    tasksCopy(_id: $_id) {
      ${taskFields}
    }
  }
`;

export default {
  tasksAdd,
  tasksEdit,
  tasksRemove,
  tasksChange,
  tasksUpdateOrder,
  tasksWatch,
  tasksCopy,
};
