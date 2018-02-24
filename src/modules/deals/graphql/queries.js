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
      pipelineId
    }
  }
`;

const deals = `
  query deals($stageId: String!) {
    deals(stageId: $stageId) {
      _id
      stageId
      pipelineId
      customer {
        _id
        name
      }
      amount
    }
  }
`;

const companies = `
  query companies {
    companies {
      _id
      name
      customers {
        _id
        name
      }
    }
  }
`;

const products = `
  query products {
    products {
      _id
      name
    }
  }
`;

export default {
  boards,
  boardGetLast,
  boardDetail,
  pipelines,
  stages,
  deals,
  companies,
  products
};
