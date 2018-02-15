const commonVariables = `
  $boardId: String,
  $pipelineId: String,
  $stageId: String!,
  $productIds: [String],
  $companyId: String!,
  $customerId: String!,
  $closeDate: Date!,
  $note: String
`;

const commonParams = `
  boardId: $boardId,
  pipelineId: $pipelineId,
  stageId: $stageId,
  productIds: $productIds,
  companyId: $companyId,
  customerId: $customerId,
  closeDate: $closeDate,
  note: $note
`;

const dealsAdd = `
  mutation dealsAdd(${commonVariables}) {
    dealsAdd(${commonParams}) {
      _id
      stageId
      companyId
      customerId
      amount
    }
  }
`;

const dealsEdit = `
  mutation dealsEdit($_id: String!, ${commonVariables}) {
    dealsEdit(_id: $_id, ${commonParams}) {
      _id
      stageId
      companyId
      customerId
      amount
    }
  }
`;

export default {
  dealsAdd,
  dealsEdit
};
