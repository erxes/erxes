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

const safeRemItemFields = `
  _id
  modifiedAt
  lastTrDate
  remainderId
  productId
  quantity
  uomId
  count
  branchId
  departmentId
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

const safeRemItems = `
  query safeRemItems (
    $remainderId: String!
    $statuses: [String]
  ) {
    safeRemItems (
      remainderId: $remainderId,
      statuses: $statuses
    ) {
      ${safeRemItemFields}
    }
  }
`;

const safeRemItemsCount = `
  query safeRemItemsCount (
    $remainderId: String!
    $statuses: [String]
  ) {
    safeRemItemsCount (
      remainderId: $remainderId,
      statuses: $statuses
    )
  }
`;

export default {
  safeRemainders,
  safeRemainderDetail,
  safeRemItems,
  safeRemItemsCount
};
