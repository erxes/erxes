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
`;

const commonPipelineParams = `
  name: $name,
  boardId: $boardId,
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

const commonStageParamsDef = `
  $name: String!,
  $boardId: String!,
`;

const commonStageParams = `
  name: $name,
  boardId: $boardId,
`;

const stageAdd = `
  mutation dealStagesAdd(${commonStageParamsDef}) {
    dealStagesAdd(${commonStageParams}) {
      _id
    }
  }
`;

const stageEdit = `
  mutation dealStagesEdit($_id: String!, ${commonStageParamsDef}) {
    dealStagesEdit(_id: $_id, ${commonStageParams}) {
      _id
    }
  }
`;

const stageRemove = `
  mutation dealStagesRemove($ids: [String!]!) {
    dealStagesRemove(ids: $ids)
  }
`;

export default {
  boardAdd,
  boardEdit,
  boardRemove,
  pipelineAdd,
  pipelineEdit,
  pipelineRemove,
  stageAdd,
  stageEdit,
  stageRemove
};
