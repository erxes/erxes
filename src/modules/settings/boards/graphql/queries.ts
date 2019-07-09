const boards = `
  query boards($type: String!) {
    boards(type: $type) {
      _id
      name
    }
  }
`;

const boardGetLast = `
  query boardGetLast($type: String!) {
    boardGetLast(type: $type) {
      _id
      name
    }
  }
`;

const pipelines = `
  query pipelines($boardId: String!) {
    pipelines(boardId: $boardId) {
      _id
      name
      boardId
      visibility
      memberIds
      bgColor
      members {
        _id
        email
        username
        details {
          fullName
        }
      }
    }
  }
`;

const stages = `
  query stages($pipelineId: String!) {
    stages(pipelineId: $pipelineId) {
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
  boardGetLast
};
