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
  mutation dealBoardsRemove($ids: [String!]!) {
    dealBoardsRemove(ids: $ids)
  }
`;

const commonPipelineParamsDef = `
  $name: String!,
  $boardId: String!,
  $stages: JSON
`;

const commonPipelineParams = `
  name: $name,
  boardId: $boardId,
  stages: $stages
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
  mutation dealPipelinesRemove($ids: [String!]!) {
    dealPipelinesRemove(ids: $ids)
  }
`;

export default {
  boardAdd,
  boardEdit,
  boardRemove,
  pipelineAdd,
  pipelineEdit,
  pipelineRemove
};
