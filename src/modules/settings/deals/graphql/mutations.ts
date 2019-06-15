const commonParamsDef = `
  $name: String!,
`;

const commonParams = `
  name: $name,
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
  $visibility: String!,
  $memberIds: [String],
`;

const commonPipelineParams = `
  name: $name,
  boardId: $boardId,
  stages: $stages,
  visibility: $visibility,
  memberIds: $memberIds,
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

const pipelinesUpdateOrder = `
  mutation dealPipelinesUpdateOrder($orders: [OrderItem]) {
    dealPipelinesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

export default {
  boardAdd,
  boardEdit,
  boardRemove,
  pipelineAdd,
  pipelineEdit,
  pipelineRemove,
  pipelinesUpdateOrder
};
