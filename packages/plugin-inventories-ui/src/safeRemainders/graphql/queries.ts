const listParamsDef = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
  $searchValue: String
  $departmentId: String
  $branchId: String

  $beginDate: Date
  $endDate: Date
  $productId: String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
  searchValue: $searchValue
  departmentId: $departmentId
  branchId: $branchId
  beginDate: $beginDate
  endDate: $endDate
  productId: $productId
`;

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
  modifiedAt
  status
  lastTransactionDate
  remainderId
  productId
  quantity
  uomId
  preCount
  count
  branchId
  departmentId

  product {
    _id
    code
    name
  }
  uom {
    _id
    code
    name
  }
`;

const safeRemainders = `
  query safeRemainders (
    ${listParamsDef}
  ) {
    safeRemainders (
      ${listParamsValue}
    ) {
      remainders {
        ${safeRemainderFields}
      }

      totalCount
    }
  }
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
  safeRemainders,
  safeRemainderDetail,
  safeRemainderItems,
  safeRemainderItemsCount
};
