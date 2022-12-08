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
  $productId: String
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
  productId: $productId
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
  $productId: String
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
  productId: $productId
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

export const performFields = `
  _id
  jobType
  jobReferId
  productId

  inBranchId
  inDepartmentId
  outBranchId
  outDepartmentId

  needProducts
  resultProducts
  needConfirmInfo
  resultConfirmInfo
  count
  status
  startAt
  endAt
  createdAt
  modifiedAt
  createdBy
  modifiedBy
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

export default {
  overallWorks,
  overallWorksCount,
  overallWorkDetail
};
