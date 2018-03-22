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

const boardDetail = `
  query dealBoardDetail($_id: String!) {
    dealBoardDetail(_id: $_id) {
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
    }
  }
`;

const stageDetail = `
  query dealStageDetail($_id: String!) {
    dealStageDetail(_id: $_id) {
      _id
      name
      pipelineId
      amount
    }
  }
`;

const deals = `
  query deals($stageId: String!) {
    deals(stageId: $stageId) {
      _id
    }
  }
`;

const dealDetail = `
  query dealDetail($_id: String!) {
    dealDetail(_id: $_id) {
      _id
      stageId
      pipelineId
      boardId
      companies {
        _id
        name
      }
      customers {
        _id
        firstName
        email
      }
      products {
        _id
        name
      }
      productsData
      amount
      closeDate
      note
      assignedUsers {
        _id
        email
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

const users = `
  query users {
    users {
      _id
      username
      email
      details {
        fullName
      }
    }
  }
`;

const getConfig = `
  query getConfig($code: String!) {
    getConfig(code: $code) {
      _id
      code
      value
    }
  }
`;

export default {
  boards,
  boardGetLast,
  boardDetail,
  pipelines,
  stages,
  stageDetail,
  deals,
  dealDetail,
  users,
  getConfig
};
