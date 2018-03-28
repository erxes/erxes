const boards = `
  query dealBoards {
    dealBoards {
      _id
      name
    }
  }
`;

const boardsGetLast = `
  query dealBoardGetLast {
    dealBoardGetLast {
      _id
      name
    }
  }
`;

const pipelines = `
  query dealPipelines($boardId: String!) {
    dealPipelines(boardId: $boardId) {
      _id
      name
      boardId
    }
  }
`;

const stages = `
  query dealStages($pipelineId: String!) {
    dealStages(pipelineId: $pipelineId) {
      _id
      name
      probability
      pipelineId
    }
  }
`;

export default {
  boards,
  pipelines,
  stages,
  boardsGetLast
};
