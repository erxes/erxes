const commonParamsDef = `
  $name: String!,
  $type: String!
`;

const commonParams = `
  name: $name,
  type: $type
`;

const boardAdd = `
  mutation ticketsBoardsAdd(${commonParamsDef}) {
    ticketsBoardsAdd(${commonParams}) {
      _id
    }
  }
`;

const boardEdit = `
  mutation ticketsBoardsEdit($_id: String!, ${commonParamsDef}) {
    ticketsBoardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const boardRemove = `
  mutation ticketsBoardsRemove($_id: String!) {
    ticketsBoardsRemove(_id: $_id)
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
  $nameConfig: String
  $departmentIds: [String],
  $tagId: String,
  $branchIds: [String],
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
  nameConfig: $nameConfig
  branchIds: $branchIds
`;

const pipelineAdd = `
  mutation ticketsPipelinesAdd(${commonPipelineParamsDef}) {
    ticketsPipelinesAdd(${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineEdit = `
  mutation ticketsPipelinesEdit($_id: String!, ${commonPipelineParamsDef}) {
    ticketsPipelinesEdit(_id: $_id, ${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineRemove = `
  mutation ticketsPipelinesRemove($_id: String!) {
    ticketsPipelinesRemove(_id: $_id)
  }
`;
const pipelinesArchive = `
  mutation ticketsPipelinesArchive($_id: String!) {
    ticketsPipelinesArchive(_id: $_id)
  }
`;

const pipelinesCopied = `
  mutation ticketsPipelinesCopied($_id: String!) {
    ticketsPipelinesCopied(_id: $_id)
  }
`;
const pipelinesUpdateOrder = `
  mutation ticketsPipelinesUpdateOrder($orders: [TicketsOrderItem]) {
    ticketsPipelinesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const manageExpenses = `
  mutation ticketsManageExpenses($expenseDocs: [ExpenseInput]) {
    ticketsManageExpenses(expenseDocs: $expenseDocs) {
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
  pipelinesUpdateOrder
};
