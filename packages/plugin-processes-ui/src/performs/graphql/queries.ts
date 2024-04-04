import { isEnabled } from '@erxes/ui/src/utils/core';

const paginateDefs = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
`;

const paginateParams = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
`;

const detailParamsDef = `
  $startDate: Date
  $endDate: Date
  $type: String
  $status: String
  $inBranchId: String
  $outBranchId: String
  $inDepartmentId: String
  $outDepartmentId: String
  $productIds: [String]
  $productCategoryId: String
  $jobReferId: String
`;

const detailParamsValue = `
  startDate: $startDate
  endDate: $endDate
  type: $type
  status: $status
  inBranchId: $inBranchId
  outBranchId: $outBranchId
  inDepartmentId: $inDepartmentId
  outDepartmentId: $outDepartmentId
  productIds: $productIds
  productCategoryId: $productCategoryId
  jobReferId: $jobReferId
`;

const userFields = `
  _id
  email
  username
  details {
    fullName
    shortName
  }
`;

export const performFields = `
  _id
  overallWorkId
  overallWorkKey {
    inBranchId
    inDepartmentId
    outBranchId
    outDepartmentId
    type
    typeId
  }
  type
  typeId
  status
  startAt
  dueDate
  endAt
  count
  description
  appendix
  assignedUserIds
  customerId
  companyId
  inBranchId
  inDepartmentId
  outBranchId
  outDepartmentId

  inProductsLen
  outProductsLen

  inDepartment {
    _id
    code
    title
    parentId
  }
  inBranch {
    _id
    code
    title,
    parentId
  }
  outDepartment {
    _id
    code
    title
    parentId
  }
  outBranch {
    _id
    code
    title,
    parentId
  }

  createdAt
  createdBy
  modifiedAt
  modifiedBy
  createdUser {
    ${userFields}
  }
  modifiedUser {
    ${userFields}
  }
  ${
    isEnabled('contacts')
      ? `
        customer {
          _id
          firstName
          lastName
          middleName
          primaryEmail
          primaryPhone
        }
        company {
          _id
          primaryEmail
          primaryName
          primaryPhone
        }
      `
      : ``
  }
  series

`;

const performDetailFields = `
  ${performFields}
  needProducts
  resultProducts
  inProducts
  outProducts
`;

const performs = `
  query performs(${detailParamsDef}, ${paginateDefs}) {
    performs(${detailParamsValue}, ${paginateParams}) {
      ${performFields}
    }
  }
`;

const performsCount = `
  query performsCount(${detailParamsDef}) {
    performsCount(${detailParamsValue})
  }
`;

const performDetail = `
  query performDetail($_id: String) {
    performDetail(_id: $_id) {
      ${performDetailFields}
    }
  }
`;

const series = `
  query series($search: String, $productId: String, $ids: [String], $excludeIds: Boolean, $page: Int, $perPage: Int) {
    series(search: $search, productId: $productId, ids: $ids, excludeIds: $excludeIds, page: $page, perPage: $perPage)
  }
`;

// perform documents
const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String, $subType: String) {
    documents(page: $page, perPage: $perPage, contentType: $contentType, subType: $subType) {
      _id
      contentType
      name
      createdAt
    }
  }
`;

export default {
  performs,
  performsCount,
  performDetail,
  series,
  documents
};
