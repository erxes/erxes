const boards = `
  query dealBoards {
    dealBoards {
      _id
      name
    }
  }
`;

const boardGetDefault = `
  query dealBoardGetDefault {
    dealBoardGetDefault {
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
      name
      stageId
      companies {
        _id
        name
      }
      customers {
        _id
        firstName
        email
      }
      products
      productsData
      amount
      closeDate
      description
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

const productDetail = `
  query productDetail($_id: String!) {
    productDetail(_id: $_id) {
      _id
      name
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

export default {
  boards,
  boardGetDefault,
  boardDetail,
  pipelines,
  stages,
  stageDetail,
  deals,
  dealDetail,
  productDetail,
  users
};
