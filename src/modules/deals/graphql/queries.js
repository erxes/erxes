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
      order
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
  query deals($stageId: String, $customerId: String, $companyId: String) {
    deals(stageId: $stageId, customerId: $customerId, companyId: $companyId) {
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
      pipelineId
      boardId
      companies {
        _id
        name
        website
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
        avatar
      }
    }
  }
`;

const activityLogsDeal = `
  query activityLogsDeal($_id: String!) {
    activityLogsDeal(_id: $_id) {
      date {
        year
        month
      }
      list {
        id
        action
        content
        createdAt
        by {
          _id
          type
          details {
            avatar
            fullName
          }
        }
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
  users,
  activityLogsDeal
};
