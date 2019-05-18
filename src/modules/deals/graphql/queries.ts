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
  query dealsTotalAmounts($date: ItemDate, $pipelineId: String) {
    dealsTotalAmounts(date: $date, pipelineId: $pipelineId) {
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
    $date: ItemDate,
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
  deals,
  dealDetail,
  productDetail,
  users,
  dealsTotalAmounts
};
