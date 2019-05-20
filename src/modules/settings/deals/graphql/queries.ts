const boards = `
  query dealBoards {
    dealBoards {
      _id
      name
    }
  }
`;

const boardGetLast = `
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
      type
      memberIds
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

const users = `
  query users {
    users {
      _id
      email
      username
      details {
        avatar
        fullName
      }
    }
  }
`;

export default {
  boards,
  pipelines,
  stages,
  boardGetLast,
  users
};
