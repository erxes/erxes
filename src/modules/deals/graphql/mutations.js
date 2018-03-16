const commonVariables = `
  $boardId: String,
  $pipelineId: String,
  $stageId: String!,
  $productIds: [String]!,
  $productsData: JSON!,
  $companyId: String!,
  $customerId: String!,
  $closeDate: Date!,
  $note: String,
  $assignedUserIds: [String],
  $order: Int,
`;

const commonParams = `
  boardId: $boardId,
  pipelineId: $pipelineId,
  stageId: $stageId,
  productIds: $productIds,
  productsData: $productsData,
  companyId: $companyId,
  customerId: $customerId,
  closeDate: $closeDate,
  note: $note,
  assignedUserIds: $assignedUserIds,
  order: $order
`;

const dealsAdd = `
  mutation dealsAdd(${commonVariables}) {
    dealsAdd(${commonParams}) {
      _id
    }
  }
`;

const dealsEdit = `
  mutation dealsEdit($_id: String!, ${commonVariables}) {
    dealsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const dealsRemove = `
  mutation dealsRemove($_id: String!) {
    dealsRemove(_id: $_id)
  }
`;

const dealsUpdateOrder = `
  mutation dealsUpdateOrder($_id: String, $source: OrderItem, $destination: OrderItem) {
    dealsUpdateOrder(_id: $_id, source: $source, destination: $destination) {
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
  mutation dealsChange($_id: String!, $stageId: String!, $pipelineId: String, $boardId: String) {
    dealsChange(_id: $_id, stageId: $stageId, pipelineId: $pipelineId, boardId: $boardId) {
      _id
      stageId
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
