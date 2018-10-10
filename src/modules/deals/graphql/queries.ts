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
      order
      amount

      deals {
        _id
        name
        amount
        closeDate
        assignedUsers {
          _id
          email
          details {
            fullName
            avatar
          }
        }
        modifiedAt
        modifiedBy
      }
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

const dealFields = `
  _id
  name
  stageId
  pipeline {
    _id
    name
  }
  boardId
  companies {
    _id
    primaryName
    website
  }
  customers {
    _id
    firstName
    primaryEmail
    primaryPhone
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
  stage {
    probability
  }
  modifiedAt
  modifiedBy
`;

const deals = `
  query deals($stageId: String, $customerId: String, $companyId: String) {
    deals(stageId: $stageId, customerId: $customerId, companyId: $companyId) {
      ${dealFields}
    }
  }
`;

const dealDetail = `
  query dealDetail($_id: String!) {
    dealDetail(_id: $_id) {
      ${dealFields}
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
  boardGetLast,
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
