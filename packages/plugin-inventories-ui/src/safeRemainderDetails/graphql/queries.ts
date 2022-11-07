export const safeRemainderFields = `
  _id
  createdAt
  createdBy
  modifiedAt
  modifiedBy

  date
  description

  status
  branchId
  departmentId
  productCategoryId

  branch {
    _id
    code
    title
  }
  department {
    _id
    code
    title
  }
  productCategory {
    _id
    code
    name
  }
  modifiedUser {
    _id
    details {
      avatar
      fullName
    }
  }

`;

export const safeRemainderItemFields = `
  _id
  branchId
  departmentId
  
  preCount
  count
  status
  lastTransactionDate
  remainderId
  modifiedAt

  product {
    _id
    code
    name
  }
  productId
  uom {
    _id
    code
    name
  }
  uomId\  
`;

const safeRemainderDetail = `
  query safeRemainderDetail (
    $_id: String!
  ) {
    safeRemainderDetail (
      _id: $_id
    ) {
      ${safeRemainderFields}
    }
  }
`;

const safeRemainderItems = `
  query safeRemainderItems (
    $remainderId: String!
    $status: String
    $productCategoryId: String
    $diffType: String
    $searchValue: String
  ) {
    safeRemainderItems (
      remainderId: $remainderId,
      status: $status,
      productCategoryId: $productCategoryId,
      diffType: $diffType,
      searchValue: $searchValue
    ) {
      ${safeRemainderItemFields}
    }
  }
`;

const safeRemainderItemsCount = `
  query safeRemainderItemsCount (
    $remainderId: String!
    $status: String
    $productCategoryId: String
    $diffType: String
    $searchValue: String
  ) {
    safeRemainderItemsCount (
      remainderId: $remainderId,
      status: $status,
      productCategoryId: $productCategoryId,
      diffType: $diffType,
      searchValue: $searchValue
    )
  }
`;

export default {
  safeRemainderDetail,
  safeRemainderItems,
  safeRemainderItemsCount
};
