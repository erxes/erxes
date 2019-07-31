const commonVariables = `
  $name: String!,
  $stageId: String,
  $closeDate: Date,
  $description: String,
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $order: Int,
  $priority: String,
  $attachments: [AttachmentInput]
`;

const commonParams = `
  name: $name,
  stageId: $stageId,
  companyIds: $companyIds,
  customerIds: $customerIds,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  priority: $priority,
  attachments: $attachments
`;

const commonReturn = `
  _id
  name
  stageId
  companies {
    _id
    primaryName
  }
  customers {
    _id
    firstName
    primaryEmail
  }
  closeDate
  description
  assignedUsers {
    _id
    email
    details {
      fullName
      avatar
    }
  }
  priority
  modifiedAt
  modifiedBy
`;

const tasksAdd = `
  mutation tasksAdd(${commonVariables}) {
    tasksAdd(${commonParams}) {
      ${commonReturn}
    }
  }
`;

const tasksEdit = `
  mutation tasksEdit($_id: String!, ${commonVariables}) {
    tasksEdit(_id: $_id, ${commonParams}) {
      ${commonReturn}
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
