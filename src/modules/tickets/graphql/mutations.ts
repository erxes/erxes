import { ticketFields } from './queries';

const commonVariables = `
  $stageId: String,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
  $attachments: [AttachmentInput],
  $priority: String,
  $source: String,
  $reminderMinute: Int,
  $isComplete: Boolean
`;

const commonParams = `
  stageId: $stageId,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  priority: $priority,
  source: $source,
  attachments: $attachments,
  reminderMinute: $reminderMinute,
  isComplete: $isComplete
`;

const ticketsAdd = `
  mutation ticketsAdd($name: String!, $customerIds: [String], $companyIds: [String], ${commonVariables}) {
    ticketsAdd(name: $name, customerIds: $customerIds, companyIds: $companyIds, ${commonParams}) {
      ${ticketFields}
    }
  }
`;

const ticketsEdit = `
  mutation ticketsEdit($_id: String!, $name: String, ${commonVariables}) {
    ticketsEdit(_id: $_id, name: $name, ${commonParams}) {
      ${ticketFields}
    }
  }
`;

const ticketsRemove = `
  mutation ticketsRemove($_id: String!) {
    ticketsRemove(_id: $_id) {
      _id
    }
  }
`;

const ticketsChange = `
  mutation ticketsChange($_id: String!, $destinationStageId: String!) {
    ticketsChange(_id: $_id, destinationStageId: $destinationStageId) {
      _id
    }
  }
`;

const ticketsUpdateOrder = `
  mutation ticketsUpdateOrder($stageId: String!, $orders: [OrderItem]) {
    ticketsUpdateOrder(stageId: $stageId, orders: $orders) {
      _id
    }
  }
`;

const ticketsWatch = `
  mutation ticketsWatch($_id: String!, $isAdd: Boolean!) {
    ticketsWatch(_id: $_id, isAdd: $isAdd) {
      _id
      isWatched
    }
  }
`;

export default {
  ticketsAdd,
  ticketsEdit,
  ticketsRemove,
  ticketsChange,
  ticketsUpdateOrder,
  ticketsWatch
};
