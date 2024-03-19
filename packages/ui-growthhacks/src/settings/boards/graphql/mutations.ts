const commonParamsDef = `
  $name: String!,
  $type: String!
`;

const commonParams = `
  name: $name,
  type: $type
`;

const boardAdd = `
  mutation ghBoardsAdd(${commonParamsDef}) {
    ghBoardsAdd(${commonParams}) {
      _id
    }
  }
`;

const boardEdit = `
  mutation ghBoardsEdit($_id: String!, ${commonParamsDef}) {
    ghBoardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const boardRemove = `
  mutation ghBoardsRemove($_id: String!) {
    ghBoardsRemove(_id: $_id)
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
  mutation ghPipelinesAdd(${commonPipelineParamsDef}) {
    ghPipelinesAdd(${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineEdit = `
  mutation ghPipelinesEdit($_id: String!, ${commonPipelineParamsDef}) {
    ghPipelinesEdit(_id: $_id, ${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineRemove = `
  mutation ghPipelinesRemove($_id: String!) {
    ghPipelinesRemove(_id: $_id)
  }
`;
const pipelinesArchive = `
  mutation ghPipelinesArchive($_id: String!) {
    ghPipelinesArchive(_id: $_id)
  }
`;

const pipelinesCopied = `
  mutation ghPipelinesCopied($_id: String!) {
    ghPipelinesCopied(_id: $_id)
  }
`;
const pipelinesUpdateOrder = `
  mutation ghPipelinesUpdateOrder($orders: [OrderItem]) {
    ghPipelinesUpdateOrder(orders: $orders) {
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
