const commonParamsDef = `
  $name: String!,
  $type: String!
`;

const commonParams = `
  name: $name,
  type: $type
`;

const boardAdd = `
  mutation dealBoardsAdd(${commonParamsDef}) {
    dealBoardsAdd(${commonParams}) {
      _id
    }
  }
`;

const boardEdit = `
  mutation dealBoardsEdit($_id: String!, ${commonParamsDef}) {
    dealBoardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const boardRemove = `
  mutation dealBoardsRemove($_id: String!) {
    dealBoardsRemove(_id: $_id)
  }
`;

const commonPipelineParamsDef = `
  $name: String!,
  $boardId: String!,
  $stages: JSON,
  $type: String!,
  $visibility: String!,
  $memberIds: [String],
  $bgColor: String,
  $startDate: Date,
  $endDate: Date,
  $metric: String,
  $hackScoringType: String,
  $templateId: String,
  $isCheckDate: Boolean
  $isCheckUser: Boolean
  $isCheckDepartment: Boolean
  $excludeCheckUserIds: [String],
  $numberConfig: String
  $numberSize: String
  $departmentIds: [String],
  $tagId: String
`;

const commonPipelineParams = `
  name: $name,
  boardId: $boardId,
  stages: $stages,
  type: $type,
  visibility: $visibility,
  memberIds: $memberIds,
  bgColor: $bgColor,
  hackScoringType: $hackScoringType,
  startDate: $startDate,
  endDate: $endDate,
  metric: $metric,
  templateId: $templateId,
  isCheckDate: $isCheckDate,
  isCheckUser: $isCheckUser,
  isCheckDepartment: $isCheckDepartment
  excludeCheckUserIds: $excludeCheckUserIds,
  numberConfig: $numberConfig
  numberSize: $numberSize
  departmentIds: $departmentIds
  tagId: $tagId
`;

const pipelineAdd = `
  mutation dealPipelinesAdd(${commonPipelineParamsDef}) {
    dealPipelinesAdd(${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineEdit = `
  mutation dealPipelinesEdit($_id: String!, ${commonPipelineParamsDef}) {
    dealPipelinesEdit(_id: $_id, ${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineRemove = `
  mutation dealPipelinesRemove($_id: String!) {
    dealPipelinesRemove(_id: $_id)
  }
`;
const pipelinesArchive = `
  mutation dealPipelinesArchive($_id: String!) {
    dealPipelinesArchive(_id: $_id)
  }
`;

const pipelinesCopied = `
  mutation dealPipelinesCopied($_id: String!) {
    dealPipelinesCopied(_id: $_id)
  }
`;
const pipelinesUpdateOrder = `
  mutation dealPipelinesUpdateOrder($orders: [OrderItem]) {
    dealPipelinesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const manageExpenses = `
  mutation manageExpenses($expenseDocs: [ExpenseInput]) {
    manageExpenses(expenseDocs: $expenseDocs) {
      _id,
      name,
      description,
      createdAt,
      createdBy
    }
  }
`;

export default {
  boardAdd,
  manageExpenses,
  boardEdit,
  boardRemove,
  pipelineAdd,
  pipelineEdit,
  pipelinesArchive,
  pipelinesCopied,
  pipelineRemove,
  pipelinesUpdateOrder,
};
