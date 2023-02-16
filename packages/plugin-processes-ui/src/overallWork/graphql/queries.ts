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

const listParamsDef = `
  $search: String
  $type: String
  $startDate: Date
  $endDate: Date
  $inBranchId: String
  $outBranchId: String
  $inDepartmentId: String
  $outDepartmentId: String
  $productCategoryId: String
  $productIds: [String]
  $vendorIds: [String]
  $jobCategoryId: String
  $jobReferId: String
`;

const listParamsValue = `
  search: $search
  type: $type
  startDate: $startDate
  endDate: $endDate
  inBranchId: $inBranchId
  outBranchId: $outBranchId
  inDepartmentId: $inDepartmentId
  outDepartmentId: $outDepartmentId
  productCategoryId: $productCategoryId
  productIds: $productIds
  vendorIds: $vendorIds
  jobCategoryId: $jobCategoryId
  jobReferId: $jobReferId
`;

const detailParamsDef = `
  $startDate: Date
  $endDate: Date
  $type: String
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
  inBranchId: $inBranchId
  outBranchId: $outBranchId
  inDepartmentId: $inDepartmentId
  outDepartmentId: $outDepartmentId
  productIds: $productIds
  productCategoryId: $productCategoryId
  jobReferId: $jobReferId
`;

export const overallWorkFields = `
  _id
  key {
    inBranchId
    inDepartmentId
    outBranchId
    outDepartmentId
    type
    typeId
  }
  type
  workIds
  count
  needProducts
  resultProducts

  jobRefer {
    _id
    code
    name
    categoryId
  }
  product {
    _id
    code
    name
    categoryId
  }

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
`;

export const overallWorkDetailFields = `
  ${overallWorkFields}
  startAt
  dueDate
  interval
  intervalId
  needProductsData
  resultProductsData
`;

const overallWorks = `
  query overallWorks(${listParamsDef}, ${paginateDefs}) {
    overallWorks(${listParamsValue}, ${paginateParams}) {
      ${overallWorkFields}
    }
  }
`;

const overallWorksCount = `
  query overallWorksCount(${listParamsDef}) {
    overallWorksCount(${listParamsValue})
  }
`;

const overallWorkDetail = `
  query overallWorkDetail(${detailParamsDef}) {
    overallWorkDetail(${detailParamsValue}) {
      ${overallWorkDetailFields}
    }
  }
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

`;

export default {
  overallWorks,
  overallWorksCount,
  overallWorkDetail
};
