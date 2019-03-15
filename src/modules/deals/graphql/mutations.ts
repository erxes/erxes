const commonVariables = `
  $name: String!,
  $stageId: String,
  $productsData: JSON,
  $companyIds: [String],
  $customerIds: [String],
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
`;

const commonParams = `
  name: $name,
  stageId: $stageId,
  productsData: $productsData,
  companyIds: $companyIds,
  customerIds: $customerIds,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order
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
  products
  amount
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
  modifiedAt
  modifiedBy
`;

const dealsAdd = `
  mutation dealsAdd(${commonVariables}) {
    dealsAdd(${commonParams}) {
      ${commonReturn}
    }
  }
`;

const dealsEdit = `
  mutation dealsEdit($_id: String!, ${commonVariables}) {
    dealsEdit(_id: $_id, ${commonParams}) {
      ${commonReturn}
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

const dealsUpdateOrder = `
  mutation dealsUpdateOrder($stageId: String!, $orders: [OrderItem]) {
    dealsUpdateOrder(stageId: $stageId, orders: $orders) {
      _id
    }
  }
`;

const stagesUpdateOrder = `
  mutation dealStagesUpdateOrder($orders: [OrderItem]) {
    dealStagesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const dealsChange = `
  mutation dealsChange($_id: String!, $stageId: String!) {
    dealsChange(_id: $_id, stageId: $stageId) {
      ${commonReturn}
    }
  }
`;

const stagesChange = `
  mutation dealStagesChange($_id: String!, $pipelineId: String!) {
    dealStagesChange(_id: $_id, pipelineId: $pipelineId) {
      _id
    }
  }
`;

export default {
  dealsAdd,
  dealsEdit,
  dealsRemove,
  dealsUpdateOrder,
  stagesUpdateOrder,
  dealsChange,
  stagesChange
};
