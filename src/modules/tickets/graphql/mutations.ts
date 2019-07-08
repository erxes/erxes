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
  $source: String,
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
  source: $source
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
  source
  modifiedAt
  modifiedBy
`;

const ticketsAdd = `
  mutation ticketsAdd(${commonVariables}) {
    ticketsAdd(${commonParams}) {
      ${commonReturn}
    }
  }
`;

const ticketsEdit = `
  mutation ticketsEdit($_id: String!, ${commonVariables}) {
    ticketsEdit(_id: $_id, ${commonParams}) {
      ${commonReturn}
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
