const boards = `
  query dealBoards {
    dealBoards {
      _id
      name

      pipelines {
        _id
        name
      }
    }
  }
`;

const boardGetLast = `
  query dealBoardGetLast {
    dealBoardGetLast {
      _id
      name

      pipelines {
        _id
        name
      }
    }
  }
`;

const boardDetail = `
  query dealBoardDetail($_id: String!) {
    dealBoardDetail(_id: $_id) {
      _id
      name

      pipelines {
        _id
        name
      }
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

const pipelineDetail = `
  query dealPipelineDetail($_id: String!) {
    dealPipelineDetail(_id: $_id) {
      _id
      name
      boardId
    }
  }
`;

const pipelineGetLast = `
  query dealPipelineGetLast {
    dealPipelineGetLast {
      _id
      name
    }
  }
`;

const stages = `
  query dealStages($pipelineId: String!, $search: String) {
    dealStages(pipelineId: $pipelineId, search: $search) {
      _id
      name
      order
      amount
      dealsTotalCount
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
      dealsTotalCount
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

const dealsTotalAmounts = `
  query dealsTotalAmounts($date: DealDate $pipelineId: String) {
    dealsTotalAmounts(date: $date pipelineId: $pipelineId) {
      _id
      dealCount
      dealAmounts {
        _id
        currency
        amount
      }
    }
  }
`;

const deals = `
  query deals(
    $pipelineId: String,
    $stageId: String, 
    $customerId: String, 
    $companyId: String ,
    $date: DealDate,
    $skip: Int,
    $search: String
  ) {
    deals(
      pipelineId: $pipelineId,
      stageId: $stageId, 
      customerId: $customerId, 
      companyId: $companyId,
      date: $date,
      skip: $skip,
      search: $search
    ) {
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

export default {
  boards,
  boardGetLast,
  boardDetail,
  pipelines,
  pipelineGetLast,
  pipelineDetail,
  stages,
  stageDetail,
  deals,
  dealDetail,
  productDetail,
  users,
  dealsTotalAmounts
};
