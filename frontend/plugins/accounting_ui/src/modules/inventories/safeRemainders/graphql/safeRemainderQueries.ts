import { gql } from '@apollo/client';

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
  remainderId
  modifiedAt
  order

  product {
    _id
    code
    name
  }
  productId
  uom
`;

const safeRemFilterParamDefs = `
  $searchValue: String
  $departmentId: String
  $branchId: String

  $beginDate: Date
  $endDate: Date
  $productId: String
`;

const safeRemFilterParams = `
  searchValue: $searchValue
  departmentId: $departmentId
  branchId: $branchId
  beginDate: $beginDate
  endDate: $endDate
  productId: $productId
`;

const commonParamDefs = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int
`;

const commonParams = `
  page: $page,
  perPage: $perPage
  sortField: $sortField,
  sortDirection: $sortDirection
`;

export const SAFE_REMAINDERS_QUERY = gql`
  query SafeRemainders(${safeRemFilterParamDefs}, ${commonParamDefs}) {
    safeRemainders(${safeRemFilterParams}, ${commonParams}) {
      remainders {
        ${safeRemainderFields}
      }
      totalCount
      
    }
  }
`
export const SAFE_REMAINDER_DETAIL_QUERY = gql`
  query SafeRemainderDetail($_id: String!) {
    safeRemainderDetail(_id: $_id) {
      ${safeRemainderFields}
    }
  }
`;

export const SAFE_REMAINDER_DETAILS_QUERY = gql`
  query SafeRemainderItems(
    $remainderId: String!
    $status: String
    $productCategoryIds: [String]
    $diffType: String
    $searchValue: String
    $page: Int
    $perPage: Int
  ) {
    safeRemainderItems(
      remainderId: $remainderId,
      status: $status,
      productCategoryIds: $productCategoryIds,
      diffType: $diffType,
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      ${safeRemainderItemFields}
    }
    safeRemainderItemsCount(
      remainderId: $remainderId,
      status: $status,
      productCategoryIds: $productCategoryIds,
      diffType: $diffType,
      searchValue: $searchValue
    )
  }
`;
