import { taskFields } from './queries';

const commonVariables = `
  $stageId: String,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
  $priority: String,
  $attachments: [AttachmentInput]
`;

const commonParams = `
  stageId: $stageId,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  priority: $priority,
  attachments: $attachments
`;

const tasksAdd = `
  mutation tasksAdd($name: String!, ${commonVariables}) {
    tasksAdd(name: $name, ${commonParams}) {
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

export default {
  tasksAdd,
  tasksEdit,
  tasksRemove,
  tasksChange,
  tasksUpdateOrder,
  tasksWatch
};
