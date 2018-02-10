const boards = `
  query dealBoards {
    dealBoards {
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
    }
  }
`;

export default {
  boards,
  pipelines
};
